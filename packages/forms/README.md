# @rakered/forms

Tiny helper to help with form submissions

![social image](https://github.com/rakered/rakered/raw/main/packages/forms/docs/social.jpg)

## Usage

The most basic helper is `getFormData`, it takes either the `event` directly, or an HTML `form` element. What it returns, is a dictionary holding the values of the form.

```js
import { getFormData } from '@rakered/forms';

const onSubmit = (event) => {
  const data = getFormData(event);
  // » { name: 'smeijer', password: { digest: 'd03…83e', algorithm: 'sha-256' } }
};

<form onSubmit={onSubmit}>
  <input name="user" />
  <input name="password" type="password" />
</form>;
```

Because we often want to wrap submit handlers between `event.preventDefault()` and `return false`, there is a `handleSubmit` helper that does exactly that.

```js
import { handleSubmit } from '@rakered/forms';

const onSubmit = handleSubmit((values) => {
  // » { name: 'smeijer' }
});

<form onSubmit={onSubmit}>
  <input name="user" />
</form>;
```

### Path expansions

Where applicable, input names will be expanded to object structures

```js
<form onSubmit={onSubmit}>
  <input name="user.name" value="Stephan Meijer" />
  <input name="user.age" type="number" value="34" />
  <input name="hobbies[]" value="chess" />
  <input name="hobbies[]" value="art" />
</form>
```

serializes to:

```json5
{
  user: {
    name: 'Stephan Meijer',
    age: 34,
  },
  hobbies: ['chess', 'art'],
}
```

### Type Coercion

A number of specific input types, are coerced to the proper data type.

- **password** _{ digest: String, algorithm: 'sha-256' }_
  This one is important, so let's start with that. Passwords are hashed using [@rakered/hash][rakered/hash], so you won't be reading the password that the user entered. Please don't try to work arround this. Instead, embrace it.

- **datetime-local** _Date_
  The `datetime-local` input stores a full date, so the is converted to a proper Date. Other date-like fields, such as `date`, `time`, or `week` only support partial dates, and are left alone.

- **checkbox** _Boolean_

- **number** _Number_

- **range** _Number_

### Typescript

Both methods are typed and accept a generic to make the `values` a typed object. Together with the typecoercion, this can simplify form handling a lot.

```tsx
interface User {
  name: string;
  age: number;
}

const signup = handleSubmit<User>((values) => {
  // » { name: 'smeijer', age: 34 }
});

<form onSubmit={signup}>
  <input name="user" />
  <input name="age" type="number" />
</form>;
```

[rakered/hash]: https://github.com/rakered/rakered/tree/main/packages/hash
