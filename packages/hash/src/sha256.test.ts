import crypto from 'crypto';
import hash from './sha256';

function cryptoHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

test('can hash string', () => {
  expect(hash('hunter2')).toEqual(
    'f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7'
  );
});

test('hash function has same output as node crypto', () => {
  const data = 'hunter2';
  expect(hash(data)).toEqual(cryptoHash(data));
});

test('can hash extended range unicode characters', () => {
  const data = 'ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
  expect(hash(data)).toEqual(cryptoHash(data));
});

test('can hash higher unicode characters', () => {
  const data = 'ઓઔકખગઘઙચછજઝઞટઠડઢણતથદધન઩પફબભમય';
  expect(hash(data)).toEqual(cryptoHash(data));
});
