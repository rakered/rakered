import picoid from 'picoid';
import { Context, TokenResult } from '../types';
import { SHA256 } from '../lib/password';
import { isValidEmail, normalizeEmail } from '../lib/email';
import { random } from '../lib/random';
import { UserInputError } from '@rakered/errors';

export interface EmailVerificationTokenDocument {
  email: string;
}

async function createEmailVerificationToken(
  { email }: EmailVerificationTokenDocument,
  { collection }: Context,
): Promise<TokenResult> {
  if (typeof email !== 'string' || !isValidEmail(email)) {
    throw new UserInputError('Email is invalid.');
  }

  email = normalizeEmail(email);
  const digits = random(100_000, 999_999).toString();
  const token = picoid();
  const hashedToken = SHA256(token);
  const hashedDigits = SHA256(digits);

  const { modifiedCount } = await collection.updateOne(
    { 'emails.address': email },
    {
      $set: { 'emails.$.token': hashedToken, 'emails.$.digits': hashedDigits },
    },
  );

  if (modifiedCount !== 1) {
    throw new UserInputError('Email is unknown.');
  }

  return {
    token,
    expires: 0,
  };
}

export default createEmailVerificationToken;
