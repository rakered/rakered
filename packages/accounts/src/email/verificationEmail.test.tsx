import { createVerificationEmail } from './verificationEmail';
import { EmailOptions } from '../types';

test('verification mail contains verify link', async () => {
  process.env.MAIL_URL = '';

  const options: EmailOptions = {
    to: 'hunter@example.com',
    from: 'noreply@example.com',
    siteUrl: 'https://example.com',
    siteName: 'Example',
    logoUrl: 'https://example.com/logo.png',
    magicLink: 'https://example.com/verify',
  };

  const mail = createVerificationEmail(options);

  expect(mail).toMatchPartial({
    to: options.to,
    from: options.from,
  });

  expect(mail.html).toContain(options.siteUrl);
  expect(mail.html).toContain(options.siteName);
  expect(mail.html).toContain(options.logoUrl);
  expect(mail.html).toContain(options.magicLink);
});
