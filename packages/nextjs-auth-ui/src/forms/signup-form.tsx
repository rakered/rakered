import { Password } from '@rakered/accounts/lib/types';
import { handleSubmit } from '@rakered/forms';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';

import { State } from '../types';
import Button from '../shared/button';
import Field from '../shared/field';
import Input from '../shared/input';
import { useStore } from '../store';
import { getError } from '../utils';

export type SignupFormData = {
  name: string;
  email: string;
  password: Password;
};

export type SignupFormProps = {
  onSignup?: ({ redirectTo }: { redirectTo: string }) => Promise<void>;
};

export function SignupForm({ onSignup }: SignupFormProps): ReactElement {
  const router = useRouter();
  const redirect = router.query.redirect as string;

  const [state, setState] = useState<State<SignupFormData>>({
    status: 'idle',
  });

  const join = useStore((state) => state.join);

  const onSubmit = handleSubmit<SignupFormData>((values) => {
    setState({ status: 'loading', values });
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        const res = await join(state.values);
        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
      case 'success': {
        if (typeof onSignup === 'function') {
          await onSignup({ redirectTo: redirect });
        } else {
          await router.push(redirect || '/');
        }
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state.status]);

  return (
    <form method="POST" onSubmit={onSubmit} className="w-full space-y-6">
      <Field label="Full name" error={getError(state, /^name/i)}>
        <Input
          tabIndex={1}
          type="text"
          name="name"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Email" error={getError(state, /^email/i)}>
        <Input
          tabIndex={2}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password" error={getError(state, /^password/i)}>
        <Input
          tabIndex={3}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field>
        <Button
          state={state.status === 'error' ? 'idle' : state.status}
          type="submit"
          tabIndex={4}
          color="blue"
          text="Sign Up"
          ariaText="Create your account"
          ariaLoadingAlert="Creating your account"
          ariaSuccessAlert="Account created"
          ariaErrorAlert="Error while creating your account"
        />
      </Field>
    </form>
  );
}
