import argon from 'argon2';

import type { Context, AuthTokenResult, Password } from '../types';
import { getPasswordString, SHA256 } from '../lib/password';
import { RESET_TOKEN_EXPIRY_SECONDS } from '../lib/constants';
import { createTokens } from '../lib/jwt';
import { UserInputError } from '@rakered/errors';

export interface ResetPasswordDocument {
  token: string;
  password: Password;
}

async function resetPassword(
  { token, password }: ResetPasswordDocument,
  { collection }: Context,
): Promise<AuthTokenResult> {
  if (typeof token !== 'string' || typeof password !== 'string') {
    throw new UserInputError('Invalid token or password provided.');
  }

  const passwordString = getPasswordString(password);
  const hashedPassword = await argon.hash(passwordString);

  const expiryDate = new Date(Date.now() - RESET_TOKEN_EXPIRY_SECONDS * 1000);

  const { value } = await collection.findOneAndUpdate(
    {
      'services.password.reset.token': SHA256(token),
      'services.password.reset.when': { $gte: expiryDate },
    },
    {
      $unset: {
        'services.password.reset': true,
        'services.password.bcrypt': true,
      },
      $set: {
        'services.password.argon': hashedPassword,
        updatedAt: new Date(),
      },
    },
    { returnOriginal: false },
  );

  if (!value) {
    throw new UserInputError('Invalid or expired token provided.');
  }

  return createTokens(value);
}

export default resetPassword;
