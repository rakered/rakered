import { normalizeEmail, isValidEmail } from './email';

test('email is valid when all parts are present', () => {
  expect(isValidEmail('a@b.c')).toEqual(true);
});

test('empty string is not a valid email', () => {
  expect(isValidEmail('')).toEqual(false);
});

test('isValidEmail cannot handles missing input', () => {
  // @ts-ignore
  expect(isValidEmail()).toEqual(false);
});

test('email is normalized to trimmed lower case', () => {
  expect(normalizeEmail(' A@b.C ')).toEqual('a@b.c');
});

test('normalize handles empty strings', () => {
  expect(normalizeEmail('')).toEqual('');
});

test('normalize handles missing input', () => {
  // @ts-ignore
  expect(normalizeEmail()).toEqual('');
});
