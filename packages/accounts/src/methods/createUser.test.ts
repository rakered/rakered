import { Accounts } from '../accounts';
import { initForTest } from './__tests__/helpers';

let accounts: Accounts;

beforeAll(async () => {
  accounts = await initForTest('createUser');
});

beforeEach(async () => {
  await accounts.collection.deleteMany({});
});

afterAll(async () => {
  await accounts.disconnect();
});

test('does basic input validation', async () => {
  // call without email or username
  await expect(accounts.createUser({ password: 'hunter2' })).rejects.toThrow(
    'Either email or username should be provided.',
  );

  // call without email and password
  // @ts-ignore
  await expect(accounts.createUser({ username: 'hunter2' })).rejects.toThrow(
    'Password should be provided if email is not given.',
  );

  // call with invalid email
  await expect(
    accounts.createUser({ email: 'hunter@domain', password: 'hunter2' }),
  ).rejects.toThrow('Email is invalid or already taken.');
});

test('can create user', async () => {
  const result = await accounts.createUser({
    email: 'hunter@example.com',
    password: 'hunter2',
  });

  expect(result.accessToken).toBeTruthy();
  expect(result.refreshToken).toBeTruthy();

  expect(result).toMatchPartial({
    user: { email: 'hunter@example.com' },
  });
});

test('cannot create user with same email address', async () => {
  const email = 'hunter@example.com';

  const create = () => accounts.createUser({ email, password: 'hunter2' });

  await expect(create()).resolves.toMatchPartial({
    user: { email },
  });

  await expect(create()).rejects.toThrow(`Email is invalid or already taken.`);
});

test('cannot create user with same or similar looking username', async () => {
  const create = (username) =>
    accounts.createUser({ username, password: 'hunter2' });

  await expect(create('hunter')).resolves.toMatchPartial({
    user: { username: 'hunter' },
  });

  await expect(create('hunter')).rejects.toThrow(
    `Username hunter is unavailable.`,
  );

  await expect(create('Hunter')).rejects.toThrow(
    `Username Hunter is unavailable.`,
  );

  await expect(create('hun-ter')).rejects.toThrow(
    `Username hun-ter is unavailable.`,
  );
});

test('cannot create user with reserved username', async () => {
  const create = async (username) =>
    accounts.createUser({ username, password: 'hunter2' });

  await expect(create('anonymous')).rejects.toThrow(
    `Username anonymous is unavailable.`,
  );
  await expect(create('owner')).rejects.toThrow(
    `Username owner is unavailable.`,
  );
});

test('cannot create user with invalid pattern', async () => {
  const create = async (username) =>
    accounts.createUser({ username, password: 'hunter2' });

  await expect(create('hun-ter')).resolves.toMatchPartial({
    user: { username: 'hun-ter' },
  });

  await expect(create('hun.ter')).rejects.toThrow(
    `Username hun.ter is invalid.`,
  );

  await expect(create('hun--ter')).rejects.toThrow(
    `Username hun--ter is invalid.`,
  );
});
