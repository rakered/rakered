import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import createEmailVerificationToken from './createEmailVerificationToken';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('createEmailVerificationToken');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('does basic input validation', async () => {
  // call without email
  // @ts-ignore
  await expect(createEmailVerificationToken({}, context)).rejects.toThrow(
    'Email is invalid.',
  );

  // call with invalid email
  await expect(
    createEmailVerificationToken({ email: 'hunter@domain' }, context),
  ).rejects.toThrow('Email is invalid.');
});

test('can request verification token', async () => {
  const { token } = await createEmailVerificationToken(
    { email: 'hunter@example.com' },
    context,
  );

  const user = await accounts.collection.findOne({
    _id: identity.user._id,
  });

  const hashedToken = user!.emails?.[0].token;
  expect(typeof token).toEqual('string');
  expect(typeof hashedToken).toEqual('string');
  expect(token).not.toEqual(hashedToken);
});

test('can not request verification token for unregistered email', async () => {
  await expect(
    createEmailVerificationToken({ email: 'unknown@example.com' }, context),
  ).rejects.toThrow('Email is unknown.');
});
