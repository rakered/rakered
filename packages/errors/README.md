# @rakered/errors

Convenient custom errors matching http status code

![social image](https://github.com/rakered/rakered/raw/main/packages/errors/docs/social.jpg)

## Usage

```js
import { AuthenticationError } from '@rakered/errors';

throw new AuthenticationError('you need to be logged in');
// » { code: 401, message: 'you need to be logged in' }
```
