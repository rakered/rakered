import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('addEmail');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can add email to existing account', async () => {
  await accounts.addEmail({
    userId: identity.user._id,
    email: 'hunter-new@example.com',
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });

  expect(user!.emails).toMatchPartial([
    { address: 'hunter@example.com' },
    { address: 'hunter-new@example.com', verified: false },
  ]);
});

test('can add email to existing account in verified state', async () => {
  await accounts.addEmail({
    userId: identity.user._id,
    email: 'hunter-new@example.com',
    verified: true,
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });

  expect(user!.emails).toMatchPartial([
    { address: 'hunter@example.com' },
    { address: 'hunter-new@example.com', verified: true },
  ]);
});

test('throws error when invalid email was provided', async () => {
  await expect(
    accounts.addEmail({
      userId: identity.user._id,
      email: 'hunter-new',
      verified: true,
    }),
  ).rejects.toThrow('Email is invalid or already taken.');
});

test('throws when email is already registered', async () => {
  await expect(
    accounts.addEmail({
      userId: identity.user._id,
      email: 'hunter@example.com',
      verified: true,
    }),
  ).rejects.toThrow('Incorrect userId provided or email already taken.');
});

test('throws when email does not belong to given user', async () => {
  await expect(
    accounts.addEmail({
      userId: 'abc',
      email: 'hunter-new@example.com',
      verified: true,
    }),
  ).rejects.toThrow('Incorrect userId provided or email already taken.');
});

test('throws when adding email that belongs to different user', async () => {
  const { user } = await accounts.createUser({
    username: 'other-user',
    password: { digest: 'hi', algorithm: 'sha-256' },
  });

  await expect(
    accounts.addEmail({
      userId: user._id,
      email: 'hunter@example.com',
      verified: true,
    }),
  ).rejects.toThrow('Email is invalid or already taken.');
});
