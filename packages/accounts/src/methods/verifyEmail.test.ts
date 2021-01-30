import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';

import createEmailVerificationToken from './createEmailVerificationToken';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('verifyEmail');
  context = getTestContext(accounts);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
  identity = await accounts.createUser(TEST_USER);
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can request verification token and use it to verify email', async () => {
  const { token } = await createEmailVerificationToken(
    { email: 'hunter@example.com' },
    context,
  );

  const result = await accounts.verifyEmail({ token });

  expect(typeof result.refreshToken).toEqual('string');
  expect(typeof result.accessToken).toEqual('string');
  expect(result.user).toEqual(identity.user);

  const doc = await accounts.collection.findOne({ _id: identity.user._id });

  // verify that the email is verified
  expect(doc!.emails?.[0]).toMatchPartial({
    address: 'hunter@example.com',
    verified: true,
  });
});

test('can not verify email with invalid token', async () => {
  const { token } = await createEmailVerificationToken(
    { email: 'hunter@example.com' },
    context,
  );

  await createEmailVerificationToken({ email: 'hunter@example.com' }, context);

  // test with a token that has been replaced
  await expect(accounts.verifyEmail({ token })).rejects.toThrow(
    'Invalid or expired token provided.',
  );

  // @ts-ignore ensure that token is required
  await expect(accounts.verifyEmail({ token: null })).rejects.toThrow(
    'Invalid token provided.',
  );
});
