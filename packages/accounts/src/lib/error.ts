import { ERROR_CODES } from './constants';

export function isDuplicateKeyError(error: any, key: string): boolean {
  const isDuplicate =
    error &&
    error.name === 'MongoError' &&
    error.code === ERROR_CODES.DUPLICATE_KEY;

  return isDuplicate && !!error.keyPattern[key];
}
