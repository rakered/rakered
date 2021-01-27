import { hash } from './index';

test('hash returns a type of HashResult', () => {
  expect(hash('hunter2')).toEqual({
    algorithm: 'sha-256',
    digest: 'f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7',
  });
});
