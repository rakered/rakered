# @rakered/nextjs-auth-api

Next.js SDK for using user authentication persisted in MongoDB

![social image](https://github.com/rakered/rakered/raw/main/packages/nextjs-auth-api/docs/social.jpg)

## Usage

Create a Dynamic API Route handler at `/pages/api/auth/[...slug].js`

```js
import { handleAuth } from '@rakered/nextjs-auth-api';

export default handleAuth();
```

## Getting Started

### Environment Variables

The library needs the following required configuration keys. These can be configured in a .env.local file in the root of your application (See more info about [loading environmental variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)):

- **MAIL_URL** _String_

  The smtp url for the mail server to use.

  Optional when running in development mode

- **JWT_SECRET** _String_

  The secret to sign the jwt tokens with.

- **EMAIL_FROM** _String_

  The email address that's being used as sender.

  Optional if `options.email.from` is provided

- **BASE_URL** _String_

  The url that will be prefixed to magic urls and provided to the email template.

  Optional if `options.email.siteUrl` is provided

- **SITE_NAME** _String_

  The site name that will be provided to the email template.

  Optional if `options.email.siteName` is provided

- **LOGO_URL** _String_

  The url for the logo that will be shown in the email.

  Optional if `options.email.logoUrl` is provided

### API Route

Create a Dynamic API Route handler at `/pages/api/auth/[...slug].js`

```js
import { handleAuth } from '@rakered/nextjs-auth-api';

export default handleAuth();
```

This will create the following urls:

```shell
/api/auth/create-account
/api/auth/enroll-account
/api/auth/login
/api/auth/logout
/api/auth/refresh-token
/api/auth/reset-password
/api/auth/verify-email
```
