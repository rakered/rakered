import { Accounts } from '../accounts';
import { Context, AuthTokenResult } from '../types';
import createPasswordResetToken from './createPasswordResetToken';
import { getTestContext, initForTest, TEST_USER } from './__tests__/helpers';

let accounts: Accounts;
let identity: AuthTokenResult;
let context: Context;

beforeAll(async () => {
  accounts = await initForTest('resetPassword');
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
  // call without token
  await expect(
    // @ts-ignore
    accounts.resetPassword({ password: 'hunter3' }),
  ).rejects.toThrow('Invalid token or password provided.');

  // call without password
  await expect(
    // @ts-ignore
    accounts.resetPassword({ token: 'token' }),
  ).rejects.toThrow('Invalid token or password provided.');
});

test('can request reset token, use it to reset password, and login again', async () => {
  const { token } = await createPasswordResetToken(
    { email: 'hunter@example.com' },
    context,
  );

  const resetPasswordResult = await accounts.resetPassword({
    token,
    password: 'hunter3',
  });

  expect(typeof resetPasswordResult.accessToken).toEqual('string');
  expect(typeof resetPasswordResult.refreshToken).toEqual('string');
  expect(resetPasswordResult.user).toMatchPartial({
    email: 'hunter@example.com',
  });

  // verify that we can login with new password
  await expect(
    accounts.login({
      identity: 'hunter@example.com',
      password: 'hunter3',
    }),
  ).resolves.toHaveProperty('accessToken');

  // verify that we can't login with old password
  await expect(
    accounts.login({ identity: 'hunter@example.com', password: 'hunter2' }),
  ).rejects.toThrow('Incorrect credentials provided.');
});

test('can not reset password with expired token', async () => {
  const _dateNow = Date.now.bind(global.Date);

  const { token, expires } = await createPasswordResetToken(
    { email: 'hunter@example.com' },
    context,
  );

  // 1 second after expiry date should do
  global.Date.now = jest.fn(() => expires * 1000 + 1000);

  await expect(
    accounts.resetPassword({
      token,
      password: 'hunter3',
    }),
  ).rejects.toThrow('Invalid or expired token provided.');

  global.Date.now = _dateNow;
});
