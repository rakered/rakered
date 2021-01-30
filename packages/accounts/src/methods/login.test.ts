import { init, Accounts, defaultOptions } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import { API_TOKEN_LENGTH } from '../lib/constants';
import { SHA256 } from '../lib/password';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

// hunter2
const BCRYPT = '$2b$10$9yitNxAJDs1fH6bNSgr0hO7cbkVruK/MJ/Oye53e0Tjf2UTW86yPG';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('login');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can login using email + password', async () => {
  const { refreshToken, accessToken, user } = await accounts.login({
    identity: 'hunter@example.com',
    password: 'hunter2',
  });

  expect(typeof refreshToken).toEqual('string');
  expect(typeof accessToken).toEqual('string');
  expect(user).toEqual(identity.user);
});

test('can login using username + password', async () => {
  const { refreshToken, accessToken, user } = await accounts.login({
    identity: 'AzureDiamond',
    password: 'hunter2',
  });

  expect(typeof refreshToken).toEqual('string');
  expect(typeof accessToken).toEqual('string');
  expect(user).toEqual(identity.user);
});

test('can login using a hashed password', async () => {
  const { refreshToken, accessToken, user } = await accounts.login({
    identity: 'AzureDiamond',
    password: { algorithm: 'sha-256', digest: SHA256('hunter2') },
  });

  expect(typeof refreshToken).toEqual('string');
  expect(typeof accessToken).toEqual('string');
  expect(user).toEqual(identity.user);
});

test('can login using password hashed with bcrypt', async () => {
  await accounts.collection.updateOne(
    { _id: identity.user._id },
    {
      $unset: { 'services.password.argon': true },
      $set: { 'services.password.bcrypt': BCRYPT },
    },
  );

  const { refreshToken, accessToken, user } = await accounts.login({
    identity: 'hunter@example.com',
    password: 'hunter2',
  });

  expect(typeof refreshToken).toEqual('string');
  expect(typeof accessToken).toEqual('string');
  expect(user).toEqual(identity.user);
});

test('can not login using invalid username or password', async () => {
  // no password
  await expect(
    accounts.login({
      identity: 'AzureDiamond',
      password: '',
    }),
  ).rejects.toThrow('Incorrect credentials provided.');

  // invalid password
  await expect(
    accounts.login({
      identity: 'AzureDiamond',
      password: 'strong-password',
    }),
  ).rejects.toThrow('Incorrect credentials provided.');

  // invalid username
  await expect(
    accounts.login({
      identity: 'hunter',
      password: 'strong-password',
    }),
  ).rejects.toThrow('Incorrect credentials provided.');
});

test('can not login using unknown method', async () => {
  await expect(
    accounts.login({
      identity: 'X'.repeat(API_TOKEN_LENGTH * 2),
      password: '',
    }),
  ).rejects.toThrow('Incorrect credentials provided.');

  await expect(
    // @ts-ignore
    accounts.login({ identity: null }),
  ).rejects.toThrow('Incorrect credentials provided.');
});
