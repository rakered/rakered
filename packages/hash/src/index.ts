import SHA256 from './sha256';

export interface HashResult {
  digest: string;
  algorithm: 'sha-256';
}

export function hash(string: string): HashResult {
  return {
    digest: SHA256(string),
    algorithm: 'sha-256',
  };
}

export default hash;
