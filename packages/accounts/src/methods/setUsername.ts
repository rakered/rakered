import {
  isValidUsername,
  isReservedUsername,
  normalizeUsername,
} from '../lib/username';
import { ERROR_CODES } from '../lib/constants';
import { Context } from '../types';
import { isDuplicateKeyError } from '../lib/error';

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
    throw new Error(`Username ${username} is unavailable.`);
  }

  if (!isValidUsername(username)) {
    throw new Error(`Username ${username} is invalid.`);
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
      throw new Error('Incorrect userId provided.');
    }
  } catch (e) {
    if (isDuplicateKeyError(e, 'handle')) {
      throw new Error(`Username ${username} is unavailable.`);
    }

    /* istanbul ignore next */
    throw e;
  }
}

export default setUsername;
