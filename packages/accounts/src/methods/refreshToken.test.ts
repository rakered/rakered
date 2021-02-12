import { Accounts } from '../accounts';
import { Context, AuthTokenResult, UserDocument } from '../types';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';
import { createTokens, verifyToken } from '../lib/jwt';
import { SHA256 } from '../lib/password';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;
const _dateNow = Date.now.bind(global.Date);

beforeAll(async () => {
  accounts = await initForTest('refreshToken');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterEach(() => {
  Date.now = _dateNow;
});

afterAll(async () => {
  await accounts.disconnect();
});

test('refreshing a token invalidates the current one', async () => {
  const newTokens = await accounts.refreshToken({
    refreshToken: identity.refreshToken,
    accessToken: identity.accessToken,
  });

  expect(newTokens.refreshToken).toBeTruthy();
  expect(newTokens.accessToken).toBeTruthy();

  expect(newTokens.refreshToken).not.toEqual(identity.refreshToken);
  expect(newTokens.accessToken).not.toEqual(identity.accessToken);

  const user = await accounts.collection.findOne({ _id: identity.user._id });
  const refreshTokens = user!.services.resume!.refreshTokens;
  expect(refreshTokens).toHaveLength(1);

  expect(refreshTokens![0].token).toEqual(SHA256(newTokens.refreshToken));
});

test('refreshing a token does not extend the lifetime', async () => {
  const now = Date.now();

  Date.now = jest.fn(() => now + 86_400_000); // + 1 day

  const newTokens = await accounts.refreshToken({
    refreshToken: identity.refreshToken,
    accessToken: identity.accessToken,
  });

  const oldTokenExpires = verifyToken(identity.refreshToken)!.exp * 1000;
  const newTokenExpires = verifyToken(newTokens.refreshToken)!.exp * 1000;

  // lifetime should not be extended, but due to rounding errors there can be
  // a one second shift.
  const lifetimeShift = Math.abs(newTokenExpires - oldTokenExpires);

  expect(oldTokenExpires).toBeGreaterThan(now);
  expect(newTokenExpires).toBeGreaterThan(now);
  expect(lifetimeShift).toBeLessThanOrEqual(1000);
});

test('only the last 5 tokens are persisted', async () => {
  const now = Date.now();

  const tokens = Array.from({ length: 10 }).map((_, idx) => ({
    token: idx,
    when: new Date(),
  }));

  await accounts.collection.updateOne(
    { _id: identity.user._id },
    { $push: { 'services.resume.refreshTokens': { $each: tokens } } },
  );

  await accounts.refreshToken({
    refreshToken: identity.refreshToken,
    accessToken: identity.accessToken,
  });

  const user = (await accounts.collection.findOne({
    _id: identity.user._id,
  })) as UserDocument;

  expect(user.services.resume?.refreshTokens).toHaveLength(5);
});

test('requires two tokens to refresh the token', async () => {
  await expect(
    // @ts-ignore
    accounts.refreshToken({
      refreshToken: identity.refreshToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');

  await expect(
    // @ts-ignore
    accounts.refreshToken({
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('cannot refresh token with non matching request token', async () => {
  const user = await accounts.collection.findOne({ _id: identity.user._id });
  const otherTokens = createTokens(user as UserDocument);

  await expect(
    accounts.refreshToken({
      refreshToken: identity.refreshToken,
      accessToken: otherTokens.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('cannot refresh token for deleted user', async () => {
  await accounts.collection.deleteMany({});

  await expect(
    accounts.refreshToken({
      refreshToken: identity.refreshToken,
      accessToken: identity.accessToken,
    }),
  ).rejects.toThrow('Incorrect token provided.');
});

test('throws error on invalid tokens', async () => {
  await expect(
    accounts.refreshToken({
      refreshToken: 'invalid token',
      accessToken: 'also invalid token',
    }),
  ).rejects.toThrow('Incorrect token provided.');
});
