export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const ret = {} as Omit<T, K>;
  const omitKeys = new Set(keys);

  for (const k in obj) {
    const key = (k as unknown) as K;
    if (omitKeys.has(key)) {
      continue;
    }
    const presentKey = (key as unknown) as Exclude<keyof T, K>;
    ret[presentKey] = obj[presentKey];
  }

  return ret;
}
