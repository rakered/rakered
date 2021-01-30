import crypto from 'crypto';

export function SHA256(string): string {
  return crypto.createHash('sha256').update(string).digest('hex');
}

export function getPasswordString(
  password: string | { algorithm: 'sha-256'; digest: string } | undefined,
): string {
  if (!password) {
    return '';
  }

  if (typeof password === 'string') {
    return SHA256(password);
  }

  if (password.algorithm === 'sha-256') {
    return password.digest;
  }

  /* istanbul ignore next */
  throw new Error('Invalid password hash algorithm.');
}
