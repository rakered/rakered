import smokeTest from '@rakered/email/lib/test/smokeTest';
import init, { Accounts } from '../accounts';

let accounts: Accounts;

beforeAll(async () => {
  accounts = init({
    collection: 'test_email',
  });

  await accounts.collection.deleteMany({});
  await accounts.createUser({ email: 'hunter@example.com' });
});

beforeEach(() => {
  process.env.MAIL_URL = '';
});

afterAll(async () => {
  await accounts.disconnect();
});

test('can send reset password email', async () => {
  const [result] = await smokeTest(
    accounts.sendResetPasswordEmail({ email: 'hunter@example.com' }),
  );
  expect(result).toContain('To: hunter@example.com');
});
