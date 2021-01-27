import { send } from './send';
import smokeTest from './test/smokeTest';
import { render } from './render';
import TestMail from './test/TestMail';

const sendMailMock = jest.fn();
jest.mock('nodemailer');

const nodemailer = require('nodemailer');
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

const mail = {
  to: 'hunter@example.com',
  from: 'stephan@example.com',
  subject: 'hello',
  text: 'hi there!',
  html: render(
    <TestMail code={123456} siteName="example" siteUrl="https://example.com" />,
  ),
};

beforeEach(() => {
  process.env.MAIL_URL = '';
  sendMailMock.mockClear();
  nodemailer.createTransport.mockClear();
});

test('attempts to send the mail when MAIL_URL is set', async () => {
  process.env.MAIL_URL = 'smtp://localhost:25';

  try {
    await send(mail);
    expect(sendMailMock).toHaveBeenCalledWith(mail);
  } catch (e) {
    expect(e).toEqual(1);
  }
});

test('prints the mail message when MAIL_URL not set', async () => {
  const msg = await smokeTest(send(mail));
  expect(msg).toMatch('hi there!');
});

test('throws error for invalid mail protocol', async () => {
  process.env.MAIL_URL = 'http://example.com';

  await expect(send(mail)).rejects.toThrow(
    'Email protocol must be smtp or smtps',
  );
});
