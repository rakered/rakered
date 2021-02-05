export function isDuplicateKeyError(error: any, key: string): boolean {
  const isDuplicate = error?.name === 'MongoError' && error?.code === 11000;
  return isDuplicate && !!error.keyPattern[key];
}
