import { init } from './accounts';
import { stripIndent } from 'common-tags';

test('Throws error when trying to init in production, without email & token options', async () => {
  const env = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  expect(init).toThrow(stripIndent`
    ERROR: The following errors should be fixed when running @rakered/accounts in production

      - options.email must be provided.
      - env.MAIL_URL must be provided.
      - env.JWT_SECRET must be provided.

    Please consult the docs if you're unsure how to fix this.
`);

  process.env.NODE_ENV = env;
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
