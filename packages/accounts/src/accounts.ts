import type { Collection, Db } from '@rakered/mongo';
import { create } from '@rakered/mongo';
import { INDEXES } from './lib/indexes';
import createUser, {
  CreateUserDocument,
  InviteUserDocument,
} from './methods/createUser';
import login, { LoginDocument } from './methods/login';
import {
  AuthTokenResult,
  Context,
  EmailDoc,
  InviteUserResult,
  TokenUrls,
  UserDocument,
} from './types';
import resetPassword, { ResetPasswordDocument } from './methods/resetPassword';
import verifyEmail, { VerifyEmailDocument } from './methods/verifyEmail';

import setUsername, { setUsernameDocument } from './methods/setUsername';
import addEmail, { addEmailDocument } from './methods/addEmail';
import removeEmail, { removeEmailDocument } from './methods/removeEmail';
import refreshToken, { TokenDocument } from './methods/refreshToken';
import revokeToken from './methods/revokeToken';
import sendEnrollmentEmail from './methods/sendEnrollmentEmail';
import sendVerificationEmail from './methods/sendVerificationEmail';
import sendResetPasswordEmail from './methods/sendResetPasswordEmail';
import enrollUser, { EnrollUserDocument } from './methods/enrollUser';
import { checkOption, getOption } from './lib/options';

export interface Accounts {
  createUser(user: InviteUserDocument): Promise<InviteUserResult>;
  createUser(user: CreateUserDocument): Promise<AuthTokenResult>;
  enrollUser(user: EnrollUserDocument): Promise<AuthTokenResult>;
  setUsername(options: setUsernameDocument): Promise<void>;
  addEmail(options: addEmailDocument): Promise<void>;
  removeEmail(options: removeEmailDocument): Promise<void>;
  verifyEmail(credentials: VerifyEmailDocument): Promise<AuthTokenResult>;
  resetPassword(options: ResetPasswordDocument): Promise<AuthTokenResult>;

  login(credentials: LoginDocument): Promise<AuthTokenResult>;
  refreshToken(tokens: TokenDocument): Promise<AuthTokenResult>;
  revokeToken(tokens: TokenDocument): Promise<void>;

  sendEnrollmentEmail(identity: EmailDoc): Promise<void>;
  sendVerificationEmail(identity: EmailDoc): Promise<void>;
  sendResetPasswordEmail(identity: EmailDoc): Promise<void>;

  disconnect(): Promise<void>;
  collection: Collection<UserDocument>;
}

export type EmailSettings = {
  from: string;
  siteName: string;
  siteUrl: string;
  logoUrl?: string;
};

export type Options = {
  collection?: Collection<any> | string;
  email?: EmailSettings;
  urls?: TokenUrls;
};

function createUrlResolvers(siteUrl): TokenUrls {
  const url = siteUrl.replace(/\/$/, '');

  return {
    verifyEmail: (token) => `${url}/verify-email/${token}`,
    enrollAccount: (token) => `${url}/enroll-account/${token}`,
    resetPassword: (token) => `${url}/reset-password/${token}`,
  };
}

export const defaultOptions: {
  email: EmailSettings;
  urls: TokenUrls;
} = {
  email: {
    from: getOption('EMAIL_FROM', ''),
    siteName: getOption('SITE_NAME', ''),
    siteUrl: getOption('BASE_URL', ''),
    logoUrl: getOption('LOGO_URL', ''),
  },

  urls: createUrlResolvers(getOption('BASE_URL', 'https://example.com')),
};

function checkOptions({ email }) {
  if (process.env.NODE_ENV === 'production') {
    checkOption('MAIL_URL');
  }

  if (!email.from) {
    checkOption('EMAIL_FROM');
  }

  if (!email.siteUrl) {
    checkOption('BASE_URL');
  }

  checkOption('JWT_SECRET');
}

export function init(options: Options = defaultOptions): Accounts {
  const emailOptions = { ...defaultOptions.email, ...options.email };
  const urlOptions = {
    ...createUrlResolvers(emailOptions.siteUrl),
    ...options.urls,
  };

  checkOptions({ email: emailOptions });

  let collection = options.collection;
  let db: Db;
  let indexPromises: Promise<any>[] = [];

  if (typeof collection !== 'object') {
    db = create();
    collection = db[collection || 'users'];

    if (!options.collection) {
      collection.pkPrefix = 'usr_';
    }
  }

  for (const [keys, options] of INDEXES) {
    indexPromises.push(collection.createIndex(keys, options));
  }

  // schedule a clean up for when all indexes are created, we don't wait for
  // this, so that it can run in the background. However, we can't 'disconnect'
  // before these are resolved, hence the assignment to a var
  Promise.all(indexPromises).then(() => {
    indexPromises = [];
  });

  const context: Context = {
    collection,
    email: emailOptions,
    urls: urlOptions,
  };

  return {
    createUser: (user) => createUser(user, context),
    enrollUser: (user) => enrollUser(user, context),
    setUsername: (options) => setUsername(options, context),
    addEmail: (options) => addEmail(options, context),
    removeEmail: (options) => removeEmail(options, context),
    verifyEmail: (options) => verifyEmail(options, context),
    resetPassword: (options) => resetPassword(options, context),

    login: (user) => login(user, context),
    refreshToken: (tokens) => refreshToken(tokens, context),
    revokeToken: (tokens) => revokeToken(tokens, context),

    sendEnrollmentEmail: (identity) => sendEnrollmentEmail(identity, context),
    sendVerificationEmail: (identity) =>
      sendVerificationEmail(identity, context),
    sendResetPasswordEmail: (identity) =>
      sendResetPasswordEmail(identity, context),

    disconnect: async () => {
      if (!db) {
        return;
      }

      await Promise.all(indexPromises);
      db.disconnect();
    },
    collection,
  } as Accounts;
}

export default init;
