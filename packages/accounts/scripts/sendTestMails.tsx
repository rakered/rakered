import { send, render } from '@rakered/email';
import { createEnrollmentEmail } from '../src/email/enrollmentEmail';
import { createResetPasswordEmail } from '../src/email/resetPasswordEmail';
import { createVerificationEmail } from '../src/email/verificationEmail';
import { EmailOptions } from '../src/types';

const [mailUrl] = process.argv.splice(2);

if (!mailUrl) {
  console.log(`
    This script should get the MAIL_URL as param
    
    > ts-node ./scripts/sendTestMails smtp://usr:pwd@localhost:25
  `);
  process.exit(1);
}

// copy arg to process.env, as that is what `send` uses.
process.env.MAIL_URL = mailUrl;

const options: EmailOptions = {
  from: 'noreply@example.com', // don't set this to rake.red! (spam reasons)
  siteName: 'rake.red',
  siteUrl: 'https://rake.red',
  logoUrl: 'https://github.com/rakered/rakered/raw/main/docs/logo-black.png',
  to: 'hunter@example.com',
  magicLink: 'http://example.com/magic-link',
};

Promise.resolve()
  .then(() => send(createEnrollmentEmail(options)))
  .then(() => send(createResetPasswordEmail(options)))
  .then(() => send(createVerificationEmail(options)))

  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit();
  });
