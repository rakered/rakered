import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('setUsername');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can set username', async () => {
  await accounts.setUsername({
    userId: identity.user._id,
    username: 'other-hunter',
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });

  expect(user).toMatchPartial({
    username: 'other-hunter',
    handle: 'otherhunter',
  });
});

test('can not set invalid usernames', async () => {
  const setUsername = async (username) =>
    accounts.setUsername({ username, userId: identity.user._id });

  await expect(setUsername('admin')).rejects.toThrow(
    `Username admin is unavailable.`,
  );

  await expect(setUsername('hun.ter')).rejects.toThrow(
    `Username hun.ter is invalid.`,
  );

  await expect(setUsername('hun--ter')).rejects.toThrow(
    `Username hun--ter is invalid.`,
  );
});

test('throws if user is not found', async () => {
  await expect(
    accounts.setUsername({
      userId: 'abc',
      username: 'hunter-new',
    }),
  ).rejects.toThrow(`Incorrect userId provided.`);
});

test('can not set username similar looking to already existing username', async () => {
  await accounts.createUser({
    email: 'someone@example.com',
    username: 'other-hunter',
    password: 'hi',
  });

  await expect(
    accounts.setUsername({
      userId: identity.user._id,
      username: 'Other-Hunter',
    }),
  ).rejects.toThrow(`Username Other-Hunter is unavailable.`);
});

test('can set own name to similar looking variant', async () => {
  await accounts.setUsername({
    userId: identity.user._id,
    username: 'Hun-Ter',
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });

  expect(user).toMatchPartial({
    username: 'Hun-Ter',
    handle: 'hunter',
  });
});
