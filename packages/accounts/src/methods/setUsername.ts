import {
  isValidUsername,
  isReservedUsername,
  normalizeUsername,
} from '../lib/username';
import { Context } from '../types';
import { isDuplicateKeyError } from '@rakered/mongo/lib/utils';
import { UserInputError } from '@rakered/errors';

export interface setUsernameDocument {
  userId: string;
  username: string;
}

async function setUsername(
  options: setUsernameDocument,
  context: Context,
): Promise<void> {
  const { collection } = context;

  const username = (options.username || '').trim();

  if (isReservedUsername(username)) {
    throw new UserInputError(`Username ${username} is unavailable.`);
  }

  if (!isValidUsername(username)) {
    throw new UserInputError(`Username ${username} is invalid.`);
  }

  const now = new Date();

  const doc: any = {
    username,
    handle: normalizeUsername(username),
    updatedAt: now,
  };

  try {
    const { modifiedCount } = await collection.updateOne(
      { _id: options.userId },
      { $set: doc },
    );

    if (modifiedCount !== 1) {
      throw new UserInputError('Incorrect userId provided.');
    }
  } catch (e) {
    if (isDuplicateKeyError(e, 'handle')) {
      throw new UserInputError(`Username ${username} is unavailable.`);
    }

    /* istanbul ignore next */
    throw e;
  }
}

export default setUsername;
