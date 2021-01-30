import {
  normalizeUsername,
  isReservedUsername,
  isValidUsername,
} from './username';

test('accepts non-reserved username', () => {
  expect(isReservedUsername('foobar')).toEqual(false);
});

test('admin is reserved username', () => {
  expect(isReservedUsername('admin')).toEqual(true);
});

test('marketplace is reserved', () => {
  expect(isReservedUsername('marketplace')).toEqual(true);
});

test('.well-known is a reserved username', () => {
  expect(isReservedUsername('.well-known')).toEqual(true);
});

test('reserved username handles missing input', () => {
  // @ts-ignore
  expect(isReservedUsername()).toEqual(false);
});

test('username can have letters an hyphens', () => {
  expect(isValidUsername('John-Doe')).toEqual(true);
});

test('accepts non-reserved username', () => {
  expect(isValidUsername('foobar')).toEqual(true);
});

test('empty username is not allowed', () => {
  expect(isValidUsername('')).toEqual(false);
});

test('username is being checked for minimum length', () => {
  expect(isValidUsername('aa')).toEqual(false);
});

test('username is being checked for maximum length', () => {
  expect(isValidUsername('a'.repeat(100))).toEqual(false);
});

test('username is being checked for illegal characters', () => {
  expect(isValidUsername('foo@bar.com')).toEqual(false);
});

test('username cannot start with a hyphen', () => {
  expect(isValidUsername('-john')).toEqual(false);
});

test('username cannot end with a hyphen', () => {
  expect(isValidUsername('doe-')).toEqual(false);
});

test('username cannot have consecutive hyphens', () => {
  expect(isValidUsername('john--doe')).toEqual(false);
});

test('valid username handles missing input', () => {
  // @ts-ignore
  expect(isValidUsername()).toEqual(false);
});
