import argon from 'argon2';
import {
  isValidUsername,
  isReservedUsername,
  normalizeUsername,
} from '../lib/username';

import { isValidEmail, normalizeEmail } from '../lib/email';
import { getPasswordString, SHA256 } from '../lib/password';
import { Context, AuthTokenResult, Password } from '../types';
import { isDuplicateKeyError } from '../lib/error';
import { createTokens } from '../lib/jwt';
import picoid from 'picoid';

export interface InviteUserDocument {
  email: string;
  name?: string;
  roles?: string[];
}

export interface CreateUserDocument {
  email?: string;
  name?: string;
  roles?: string[];
  username?: string;
  password: Password;
}

async function createUser(
  user: CreateUserDocument,
  context: Context,
): Promise<AuthTokenResult>;

async function createUser(
  user: InviteUserDocument,
  context: Context,
): Promise<void>;

/**
 * Create a new user account, when no password has been provided, we assume that
 * we're dealing with an invite. In that case, no refresh and access tokens are
 * returned.
 */
async function createUser(
  user: CreateUserDocument | InviteUserDocument,
  context: Context,
): Promise<AuthTokenResult | void> {
  const { collection } = context;
  const email = user.email ? normalizeEmail(user.email) : null;
  const name = user.name ? user.name.trim() : null;

  const username =
    'username' in user && user.username ? user.username.trim() : null;

  const passwordString =
    'password' in user ? getPasswordString(user.password) : '';

  if (typeof email !== 'string' && typeof username !== 'string') {
    throw new Error('Either email or username should be provided.');
  }

  if (email && !isValidEmail(email)) {
    throw new Error('Email is invalid or already taken.');
  }

  if (typeof username === 'string') {
    if (isReservedUsername(username)) {
      throw new Error(`Username ${username} is unavailable.`);
    }

    if (!isValidUsername(username)) {
      throw new Error(`Username ${username} is invalid.`);
    }
  }

  if (!email && !passwordString) {
    throw new Error(`Password should be provided if email is not given.`);
  }

  const now = new Date();

  const doc: any = {
    // TODO: detect if the user uses a mongo diver, and use mongodb.ObjectID instead;
    _id: (collection.pkPrefix || '') + picoid(),
    name: name,
    services: {},
    emails: [],
    roles: user.roles || [],
    createdAt: now,
    updatedAt: now,
  };

  if (username) {
    doc.username = username;
    doc.handle = normalizeUsername(username);
  }

  if (email) {
    doc.emails.push({
      address: email,
      verified: false,
    });
  }

  const newTokens = createTokens(doc);

  if (passwordString) {
    const hashedPassword = await argon.hash(passwordString);
    doc.services.password = { argon: hashedPassword };

    doc.services.resume = {
      refreshTokens: [
        {
          when: now,
          token: SHA256(newTokens.refreshToken),
        },
      ],
    };
  }

  try {
    await collection.insertOne(doc);
  } catch (e) {
    if (isDuplicateKeyError(e, 'emails.address')) {
      throw new Error(`Email is invalid or already taken.`);
    }

    if (isDuplicateKeyError(e, 'handle')) {
      throw new Error(`Username ${username} is unavailable.`);
    }

    /* istanbul ignore next */
    throw e;
  }

  if ('password' in user) {
    return newTokens;
  }

  return;
}

export default createUser;
