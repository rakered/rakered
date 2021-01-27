import { send, render } from '../src';
import TestMail from '../src/test/TestMail';

const [mailUrl] = process.argv.splice(2);

if (!mailUrl) {
  console.log(`
    This script should get the MAIL_URL as param
    
    > ts-node ./scripts/sendTestMail smtp://usr:pwd@localhost:25
  `);
  process.exit(1);
}

// copy arg to process.env, as that is what `send` uses.

process.env.MAIL_URL = mailUrl;

// todo, create iterator that generates plain text, or use context and attribute on Email {mode=html | text}
const mail = (
  <TestMail code={123456} siteName="example" siteUrl="https://example.com" />
);

send({
  to: 'hunter@example.com',
  from: 'stephan@example.com',
  subject: 'hello',
  text: 'hi there!',
  html: render(mail),
})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit();
  });
