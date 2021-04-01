import { Accounts } from '../accounts';
import { initForTest } from './__tests__/helpers';
import smokeTest from '@rakered/email/lib/test/smokeTest';

let accounts: Accounts;
let token;

beforeAll(async () => {
  accounts = await initForTest('enrollUser');
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});

  const { user } = await accounts.createUser({
    email: 'hunter@example.com',
  });

  const [email] = await smokeTest(accounts.sendEnrollmentEmail(user));
  token = email.match(/\/enroll-account\/(.*)\s/)[1];
});

afterAll(async () => {
  await accounts.disconnect();
});

test('does basic input validation', async () => {
  // call without token
  // @ts-ignore
  await expect(accounts.enrollUser({ password: 'hunter2' })).rejects.toThrow(
    'Token must be provided.',
  );

  // call with invalid token
  await expect(
    accounts.enrollUser({ token: 'hunter', password: 'hunter2' }),
  ).rejects.toThrow('Invalid token provided.');

  // call without password
  // @ts-ignore
  await expect(accounts.enrollUser({ token })).rejects.toThrow(
    'Password must be provided.',
  );
});

test('can enroll user', async () => {
  const result = await accounts.enrollUser({
    token,
    password: 'hunter2',
  });

  expect(result.accessToken).toBeTruthy();
  expect(result.refreshToken).toBeTruthy();

  expect(result).toMatchPartial({
    user: { email: 'hunter@example.com' },
  });
});

test('cannot enroll user with same or similar looking username', async () => {
  const enroll = (username) =>
    accounts.enrollUser({ username, password: 'hunter2', token });

  await expect(
    accounts.createUser({ username: 'azure', password: 'hunter2' }),
  ).resolves.toMatchPartial({
    user: { username: 'azure' },
  });

  await expect(enroll('azure')).rejects.toThrow(
    `Username azure is unavailable.`,
  );

  await expect(enroll('Azure')).rejects.toThrow(
    `Username Azure is unavailable.`,
  );

  await expect(enroll('azu-re')).rejects.toThrow(
    `Username azu-re is unavailable.`,
  );
});

test('cannot enroll user with reserved username', async () => {
  const enroll = async (username) =>
    accounts.enrollUser({ username, password: 'hunter2', token });

  await expect(enroll('anonymous')).rejects.toThrow(
    `Username anonymous is unavailable.`,
  );
  await expect(enroll('owner')).rejects.toThrow(
    `Username owner is unavailable.`,
  );
});

test('cannot enroll user with invalid pattern', async () => {
  const enroll = async (username) =>
    accounts.enrollUser({ username, password: 'hunter2', token });

  await expect(enroll('azu-re')).resolves.toMatchPartial({
    user: { username: 'azu-re' },
  });

  await expect(enroll('azu.re')).rejects.toThrow(`Username azu.re is invalid.`);

  await expect(enroll('azu--re')).rejects.toThrow(
    `Username azu--re is invalid.`,
  );
});
