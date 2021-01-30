import { createResetPasswordEmail } from './resetPasswordEmail';
import { EmailOptions } from '../types';

test('reset password mail contains reset link', async () => {
  process.env.MAIL_URL = '';

  const options: EmailOptions = {
    to: 'hunter@example.com',
    from: 'noreply@example.com',
    siteUrl: 'https://example.com',
    siteName: 'Example',
    logoUrl: 'https://example.com/logo.png',
    magicLink: 'https://example.com/verify',
  };

  const mail = createResetPasswordEmail(options);

  expect(mail).toMatchPartial({
    to: options.to,
    from: options.from,
  });

  expect(mail.html).toContain(options.siteUrl);
  expect(mail.html).toContain(options.siteName);
  expect(mail.html).toContain(options.logoUrl);
  expect(mail.html).toContain(options.magicLink);
});
