export function compact<T extends Record<string, any>>(source: T): Partial<T> {
  const result = {};
  const keys = Object.keys(source);

  for (const key of keys) {
    if (typeof source[key] === 'undefined' || source[key] === null) {
      continue;
    }

    result[key] = source[key];
  }

  return result;
}
