import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('removeEmail');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can remove email from account', async () => {
  await accounts.removeEmail({
    userId: identity.user._id,
    email: 'hunter@example.com',
  });

  const user = await accounts.collection.findOne({ _id: identity.user._id });

  expect(user!.emails).toHaveLength(0);
});

test('throws error when invalid email was provided', async () => {
  await expect(
    accounts.removeEmail({
      userId: identity.user._id,
      email: 'hunter-new',
    }),
  ).rejects.toThrow('Email is invalid.');
});

test('throws when email does not belong to given user', async () => {
  await expect(
    accounts.removeEmail({
      userId: 'abc',
      email: 'hunter@example.com',
      verified: true,
    }),
  ).rejects.toThrow('Incorrect userId provided or email is unknown.');
});
