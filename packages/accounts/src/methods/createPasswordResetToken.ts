import picoid from 'picoid';
import { Context, TokenResult } from '../types';
import { SHA256 } from '../lib/password';
import { RESET_TOKEN_EXPIRY_SECONDS } from '../lib/constants';
import { isValidEmail, normalizeEmail } from '../lib/email';
import { UserInputError } from '@rakered/errors';

export interface PasswordResetDocument {
  email: string;
}

async function createPasswordResetToken(
  { email }: PasswordResetDocument,
  { collection }: Context,
): Promise<TokenResult> {
  if (typeof email !== 'string' || !isValidEmail(email)) {
    throw new UserInputError('Email is invalid.');
  }

  const token = picoid();

  const reset = {
    token: SHA256(token),
    email: normalizeEmail(email),
    reason: 'reset',
    when: new Date(),
  };

  const { modifiedCount } = await collection.updateOne(
    { 'emails.address': normalizeEmail(email) },
    { $set: { 'services.password.reset': reset } },
  );

  if (modifiedCount !== 1) {
    throw new UserInputError('Email is unknown.');
  }

  const expires = Math.floor(
    reset.when.getTime() / 1000 + RESET_TOKEN_EXPIRY_SECONDS,
  );

  return {
    token,
    expires,
  };
}

export default createPasswordResetToken;
