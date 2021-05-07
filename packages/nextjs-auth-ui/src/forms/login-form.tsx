import { Password } from '@rakered/accounts/lib/types';
import { handleSubmit } from '@rakered/forms';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';

import Field from '../shared/field';
import Input from '../shared/input';
import Link from '../shared/link';
import Button from '../shared/button';

import { useStore } from '../store';
import { State } from '../types';
import { getError } from '../utils';

export type LoginFormData = {
  email: string;
  password: Password;
};

export type LoginFormProps = {
  onLogin?: ({ redirectTo }: { redirectTo: string }) => Promise<void>;
};

function exceptionToError(ex) {
  return {
    error: ex.message,
  };
}
export function LoginForm({ onLogin }: LoginFormProps): ReactElement {
  const router = useRouter();
  const redirect = router.query.redirect as string;
  const formRef = useRef<HTMLFormElement>(null);

  const login = useStore((state) => state.login);

  const [state, setState] = useState<State<LoginFormData>>({
    status: 'idle',
  });

  const onSubmit = handleSubmit<LoginFormData>((values) => {
    setState({ status: 'loading', values });
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        let res = await login(state.values).catch(exceptionToError);

        // The first login attempt uses a hashed password. It is possible that
        // the server doesn't support this, hence the second attempt
        if ('error' in res) {
          res = await login({
            email: state.values.email,
            password: formRef.current!.password.value,
          }).catch(exceptionToError);
        }

        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
      case 'success': {
        if (typeof onLogin === 'function') {
          await onLogin({ redirectTo: redirect });
        } else {
          await router.push(redirect || '/');
        }
        break;
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state.status]);

  return (
    <form
      method="POST"
      onSubmit={onSubmit}
      className="w-full space-y-6"
      ref={formRef}
    >
      <Field label="Email" error={getError(state)}>
        <Input
          invalid={state.status === 'error'}
          tabIndex={1}
          type="text"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field
        label="Password"
        alt={
          <Link href="/auth/forgot-password" tabIndex={3}>
            Forgot your password?
          </Link>
        }
      >
        <Input
          invalid={state.status === 'error'}
          tabIndex={2}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field>
        <Button
          state={state.status === 'error' ? 'idle' : state.status}
          type="submit"
          tabIndex={4}
          color="blue"
          text="Sign In"
          ariaText="Login to your account"
          ariaLoadingAlert="Logging in"
          ariaSuccessAlert="Logged in"
          ariaErrorAlert="Error while logging in"
        />
      </Field>
    </form>
  );
}
