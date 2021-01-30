import { Accounts } from '../accounts';
import { Context, AuthTokenResult, UserDocument } from '../types';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';
import { createTokens } from '../lib/jwt';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('revokeToken');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('revoking a token removes it from the database', async () => {
  await accounts.revokeToken({
    refreshToken: identity.refreshToken,
    accessToken: identity.accessToken,
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });
  const refreshTokens = user!.services.resume!.refreshTokens;
  expect(refreshTokens).toHaveLength(0);
});

test('cannot refresh a revoked token', async () => {
  await accounts.revokeToken({
    refreshToken: identity.refreshToken,
    accessToken: identity.accessToken,
  });

  await expect(
    accounts.refreshToken({
      refreshToken: identity.refreshToken,
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('requires two tokens to revoke the token', async () => {
  await expect(
    // @ts-ignore
    accounts.revokeToken({
      refreshToken: identity.refreshToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');

  await expect(
    // @ts-ignore
    accounts.revokeToken({
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('can revoke refresh token with non matching request token', async () => {
  const user = await accounts.collection.findOne({ _id: identity.user._id });
  const otherTokens = createTokens(user as UserDocument);

  await expect(
    accounts.revokeToken({
      refreshToken: identity.refreshToken,
      accessToken: otherTokens.accessToken,
    }),
  ).resolves.not.toThrow('Incorrect token provided.');
});

test('cannot revoke token for deleted user', async () => {
  await accounts.collection.deleteMany({});

  await expect(
    accounts.revokeToken({
      refreshToken: identity.refreshToken,
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('cannot revoke token for other user', async () => {
  await accounts.collection.deleteMany({});
  const otherTokens = createTokens({
    _id: 'abc',
    createdAt: new Date(),
    services: {},
    updatedAt: new Date(),
  });

  await expect(
    accounts.revokeToken({
      refreshToken: otherTokens.refreshToken,
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});
