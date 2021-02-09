import type { Context, AuthTokenResult } from '../types';
import { SHA256 } from '../lib/password';
import { createTokens } from '../lib/jwt';
import { UserInputError } from '@rakered/errors';

export interface VerifyEmailDocument {
  token: string;
}

async function verifyEmail(
  { token }: VerifyEmailDocument,
  { collection }: Context,
): Promise<AuthTokenResult> {
  if (typeof token !== 'string') {
    throw new UserInputError('Invalid token provided.');
  }

  const hashedToken = SHA256(token);

  const { value } = await collection.findOneAndUpdate(
    { 'emails.token': hashedToken },
    {
      $unset: { 'emails.$.token': true },
      $set: { 'emails.$.verified': true },
    },
    { returnOriginal: false },
  );

  // tokens don't have a expiry date, but new token requests, replace the old ones
  if (!value) {
    throw new UserInputError('Invalid or expired token provided.');
  }

  return createTokens(value);
}

export default verifyEmail;
