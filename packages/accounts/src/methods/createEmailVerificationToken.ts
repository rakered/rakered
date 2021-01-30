import picoid from 'picoid';
import { Context, TokenResult } from '../types';
import { SHA256 } from '../lib/password';
import { VERIFICATION_TOKEN_LENGTH } from '../lib/constants';
import { isValidEmail, normalizeEmail } from '../lib/email';
import { random } from '../lib/random';

export interface EmailVerificationTokenDocument {
  email: string;
}

async function createEmailVerificationToken(
  { email }: EmailVerificationTokenDocument,
  { collection }: Context,
): Promise<TokenResult> {
  if (typeof email !== 'string' || !isValidEmail(email)) {
    throw new Error('Email is invalid.');
  }

  email = normalizeEmail(email);
  const digits = random(100_000, 999_999).toString();
  const token = picoid(VERIFICATION_TOKEN_LENGTH);
  const hashedToken = SHA256(token);
  const hashedDigits = SHA256(digits);

  const { modifiedCount } = await collection.updateOne(
    { 'emails.address': email },
    {
      $set: { 'emails.$.token': hashedToken, 'emails.$.digits': hashedDigits },
    },
  );

  if (modifiedCount !== 1) {
    throw new Error('Email is unknown.');
  }

  return {
    token,
    expires: 0,
  };
}

export default createEmailVerificationToken;
