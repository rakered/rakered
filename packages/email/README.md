# @rakered/email

Compose emails using react and send them with [nodemailer](https://github.com/nodemailer/nodemailer)

![social image](https://github.com/rakered/rakered/raw/main/packages/email/docs/social.jpg)

## Usage

First, you'll need to create one or more email templates that you wish to send to your uses. For this, you'll be using react and our base components. There are various base elements, and a theme that can be modified to your needs. But let's start with an example of what you need to send a Mail.

### Sending emails

To send emails, you'll need to set `process.env.MAIL_URL` to a valid `smtp` or `smpts` url. When this environment variable is not set, mails will be printed to `stdout` (your terminal/console).

```js
import { send, render } from '@rakered/email';

await send({
  to: 'hunter@example.com',
  from: 'stephan@example.com',
  subject: 'Confirm your account',
  text: 'hi there! Please use the link below to verify…',
  html: render(<ConfirmAccountMail token="gEf…vkJ" />),
});
```

Valid SMTP urls have the following format:

```
# insecure, non ssl:
smtp://username:password@example.com:25

# secure, using ssl
smtps://username:password@example.com:456
```

### Building Templates

It's important to wrap every mail template in the `Email` component, as that components provide the context (theme data) to the various building blocks.

Next, we offer a number of building blocks, such as `Title`, `Paragraph`, and `CallToAction`. These are the components that you want to use to build your template with. Check `/src/template/blocks` if you wish to know all of them.

All basic building blocks make smart use of our grid system, which can be found in `./src/template/layout`. It is possible to use this grid system in your templates as well, but generally speaking, you should not need it.

```js
import {
  CallToAction,
  Content,
  Email,
  Header,
  Paragraph,
  Title,
} from '@rakered/email';

function ConfirmAccountMail({ siteName, siteUrl }) {
  return (
    <Email>
      <Content>
        <Header
          logo="https://example.com/logo.jpg"
          action={{ label: `Go to ${siteName}!`, url: siteUrl }}
        />

        <Title>Complete Registration</Title>

        <Paragraph>
          Please click the button below, to complete your registration
        </Paragraph>

        <CallToAction href={`https://example.com/verify/${token}`}>
          Confirm email
        </CallToAction>
      </Content>
    </Email>
  );
}
```

### Themes

Using the standard theme, your result will look something like this:

![social image](https://github.com/rakered/rakered/raw/main/packages/email/docs/standard-template.jpg)
