import argon from 'argon2';
import {
  isValidUsername,
  isReservedUsername,
  normalizeUsername,
} from '../lib/username';

import { getPasswordString, SHA256 } from '../lib/password';
import { Context, AuthTokenResult, Password } from '../types';
import { isDuplicateKeyError } from '@rakered/mongo/lib/utils';
import { createTokens } from '../lib/jwt';
import { UserInputError } from '@rakered/errors';

export interface EnrollUserDocument {
  token: string;
  name?: string;
  username?: string;
  password: Password;
}

/**
 * Complete user registration with the help of an invite token that has been
 * send earlier on.
 */
async function enrollUser(
  user: EnrollUserDocument,
  context: Context,
): Promise<AuthTokenResult> {
  const { collection } = context;

  const name = user.name ? user.name.trim() : null;
  const username = user.username ? user.username.trim() : null;
  const passwordString = getPasswordString(user.password);

  if (!user.token) {
    throw new UserInputError(`Token must be provided.`);
  }

  if (typeof username === 'string') {
    if (isReservedUsername(username)) {
      throw new UserInputError(`Username ${username} is unavailable.`);
    }

    if (!isValidUsername(username)) {
      throw new UserInputError(`Username ${username} is invalid.`);
    }
  }

  if (!passwordString) {
    throw new UserInputError(`Password must be provided.`);
  }

  const now = new Date();
  const hashedPassword = await argon.hash(passwordString);

  const doc: any = {
    name,
    'emails.$.verified': true,
    'services.password': { argon: hashedPassword },
    updatedAt: now,
  };

  if (username) {
    doc.username = username;
    doc.handle = normalizeUsername(username);
  }

  try {
    const { value } = await collection.findOneAndUpdate(
      {
        'services.password.reset.token': SHA256(user.token),
        'services.password.reset.reason': 'enroll',
        'emails.verified': false,
      },
      { $set: doc },
      { returnOriginal: false },
    );

    if (!value) {
      throw new UserInputError(`Invalid token provided.`);
    }

    const tokens = createTokens(value);

    await collection.updateOne(
      { _id: value._id },
      {
        $set: {
          'services.resume': {
            refreshTokens: [
              {
                when: now,
                token: SHA256(tokens.refreshToken),
              },
            ],
          },
        },
      },
    );

    return tokens;
  } catch (e) {
    if (isDuplicateKeyError(e, 'handle')) {
      throw new UserInputError(`Username ${username} is unavailable.`);
    }

    /* istanbul ignore next */
    throw e;
  }
}

export default enrollUser;
