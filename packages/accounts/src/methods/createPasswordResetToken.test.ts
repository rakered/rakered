import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import createPasswordResetToken from './createPasswordResetToken';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('createPasswordResetToken');
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
  await expect(createPasswordResetToken({}, context)).rejects.toThrow(
    'Email is invalid.',
  );

  // call with invalid email
  await expect(
    createPasswordResetToken({ email: 'hunter@domain' }, context),
  ).rejects.toThrow('Email is invalid.');
});

test('can request reset token', async () => {
  const { token } = await createPasswordResetToken(
    { email: 'hunter@example.com' },
    context,
  );

  const user = await accounts.collection.findOne({
    _id: identity.user._id,
  });

  const hashedToken = user?.services.password?.reset?.token;
  expect(typeof hashedToken).toEqual('string');
  expect(token).not.toEqual(hashedToken);
});

test('can not request reset token for unregistered email', async () => {
  await expect(
    createPasswordResetToken({ email: 'unknown@example.com' }, context),
  ).rejects.toThrow('Email is unknown.');
});
