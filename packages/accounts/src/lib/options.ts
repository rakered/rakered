export type ENV_KEYS =
  | 'MAIL_URL'
  | 'EMAIL_FROM'
  | 'SITE_NAME'
  | 'BASE_URL'
  | 'LOGO_URL'
  | 'JWT_SECRET';

export function getOption(key: ENV_KEYS): string | undefined;
export function getOption(key: ENV_KEYS, fallback: string): string;

export function getOption(
  key: ENV_KEYS,
  fallback?: string,
): string | undefined {
  return process.env[`RAKERED_${key}`] ?? process.env[key] ?? fallback;
}

export function checkOption(key: ENV_KEYS): void {
  const option = getOption(key);
  const isEmpty = option == null || option === '';

  if (isEmpty) {
    throw new Error(
      `'${key
        .replace(/_/g, ' ')
        .toLowerCase()}' should be provided via either env.${key} or env.RAKERED_${key}`,
    );
  }
}
