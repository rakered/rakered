import argon from 'argon2';
import bcrypt from 'bcryptjs';
import { getPasswordString, SHA256 } from '../lib/password';
import { Context, AuthTokenResult, Password } from '../types';
import { normalizeEmail } from '../lib/email';
import { cleanUser, createTokens } from '../lib/jwt';
import { normalizeUsername } from '../lib/username';
import { UserInputError } from '@rakered/errors';
import { MAX_ACTIVE_REFRESH_TOKENS } from '../lib/constants';

// Support a few variants for developer convenience
export type LoginDocument =
  | { identity: string; password: Password }
  | { email: string; password: Password }
  | { username: string; password: Password };

async function login(
  credentials: LoginDocument,
  { collection, onLogin }: Context,
): Promise<AuthTokenResult> {
  // only one of them can be provided
  const identity =
    'email' in credentials
      ? credentials.email
      : 'username' in credentials
      ? credentials.username
      : credentials.identity;

  if (typeof identity !== 'string') {
    throw new UserInputError('Incorrect credentials provided.');
  }

  const passwordString = getPasswordString(credentials.password);
  const selector = identity.includes('@')
    ? { 'emails.address': normalizeEmail(identity) }
    : { handle: normalizeUsername(identity) };

  const userDoc = await collection.findOne(selector);

  if (!userDoc) {
    throw new UserInputError('Incorrect credentials provided.');
  }

  const hashedPassword = userDoc.services.password;
  const valid = hashedPassword?.argon
    ? await argon.verify(hashedPassword.argon, passwordString)
    : hashedPassword?.bcrypt
    ? await bcrypt.compare(passwordString, hashedPassword.bcrypt)
    : false;

  if (!valid) {
    throw new UserInputError('Incorrect credentials provided.');
  }

  let user = cleanUser(userDoc);
  if (typeof onLogin === 'function') {
    user = (await onLogin(user)) || user;
  }

  const newTokens = createTokens(user);
  const update = {
    when: new Date(),
    token: SHA256(newTokens.refreshToken),
  };

  // push the new token to the end, and remove all but last n refresh tokens
  await collection.updateOne(
    { _id: user._id },
    {
      $push: {
        'services.resume.refreshTokens': {
          $each: [update],
          $slice: -MAX_ACTIVE_REFRESH_TOKENS,
        },
      },
      $set: { updatedAt: update.when },
    },
  );

  return newTokens;
}

export default login;
