import { init } from './accounts';

const ENV = { ...process.env };

beforeEach(() => {
  process.env.NODE_ENV = ENV.NODE_ENV;
  process.env.MAIL_URL = ENV.MAIL_URL;
  process.env.BASE_URL = ENV.BASE_URL;
  process.env.LOGO_URL = ENV.LOGO_URL;
  process.env.EMAIL_FROM = ENV.EMAIL_FROM;
});

test('Throws error when trying to init in production, without email & token options', async () => {
  process.env.NODE_ENV = 'production';
  delete process.env.MAIL_URL;

  expect(init).toThrow(
    `'mail url' should be provided via either env.MAIL_URL or env.RAKERED_MAIL_URL`,
  );
});

test('Throws error when trying to init without email.from', async () => {
  delete process.env.EMAIL_FROM;

  expect(() =>
    init({
      email: {
        from: '',
        siteUrl: 'https://example.com',
        siteName: '',
        logoUrl: '',
      },
    }),
  ).toThrow(
    `'email from' should be provided via either env.EMAIL_FROM or env.RAKERED_EMAIL_FROM`,
  );
});

test('Throws error when trying to init without email.siteUrl', async () => {
  delete process.env.BASE_URL;

  expect(() =>
    init({ email: { from: 'hi@me', siteUrl: '', siteName: '', logoUrl: '' } }),
  ).toThrow(
    `'base url' should be provided via either env.BASE_URL or env.RAKERED_BASE_URL`,
  );
});

test('Default collection options include pkPrefx', async () => {
  const accounts = init();

  expect(accounts.collection.pkPrefix).toEqual('usr_');
  await accounts.disconnect();
});

test('Does not throw when calling disconnect while unconnected', async () => {
  const accounts = init({
    collection: {
      createIndex: async () => {
        return null;
      },
    } as any,
  });

  await expect(accounts.disconnect).not.toThrow('');
});
