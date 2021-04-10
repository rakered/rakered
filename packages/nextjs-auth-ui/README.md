# @rakered/nextjs-auth-ui

Next.js SDK for using user authentication persisted in MongoDB

![social image](https://github.com/rakered/rakered/raw/main/packages/nextjs-auth-ui/docs/social.jpg)

## Usage

Create a Dynamic Page Route handler at `/pages/auth/[...slug].js`

```js
import '@rakered/nextjs-auth-ui/style.css';
import { handleAuth } from '@rakered/nextjs-auth-ui';

export default handleAuth();
```

This will create the following urls:

```shell
/auth/signup
/auth/login
/auth/logout
/auth/forgot-password
/auth/enroll-account/{token}
/auth/reset-password/{token}
/auth/verify-email/{token}
```
