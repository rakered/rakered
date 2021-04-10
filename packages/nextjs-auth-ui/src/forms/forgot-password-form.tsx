import { handleSubmit } from '@rakered/forms';
import { ReactElement, useEffect, useState } from 'react';

import { State } from '../types';
import Field from '../shared/field';
import Link from '../shared/link';
import Input from '../shared/input';
import Button from '../shared/button';
import { useStore } from '../store';

export type ForgotPasswordFormData = { email: string };

export function ForgotPasswordForm(): ReactElement {
  const [state, setState] = useState<State<ForgotPasswordFormData>>({
    status: 'idle',
  });

  const forgotPassword = useStore((state) => state.forgotPassword);

  const onSubmit = handleSubmit<ForgotPasswordFormData>(async (values) => {
    setState({ status: 'loading', values });
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        const res = await forgotPassword(state.values);
        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <div className="text-sm space-y-6 h-24">
        <p>Thanks, check your email for instructions to reset your password.</p>
        <p>Please check your spam folder if you didn't get an email.</p>
      </div>
    );
  }

  return (
    <form method="POST" onSubmit={onSubmit} className="w-full space-y-6">
      <p className="text-sm">
        Enter the email address associated with your account and we'll send you
        a link to reset your password.
      </p>
      <Field label="Email">
        <Input
          tabIndex={1}
          type="text"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field>
        <Button
          state={state.status === 'error' ? 'idle' : state.status}
          type="submit"
          tabIndex={2}
          color="blue"
          text="Request recovery link"
          ariaText="Request password recovery link"
          ariaLoadingAlert="Requesting recovery link"
          ariaSuccessAlert="Recovery link requested"
          ariaErrorAlert="Error while requesting link"
        >
          Request recovery link
        </Button>
      </Field>
      <Field>
        <div className="text-center">
          <Link href="/auth/login" tabIndex={3}>
            Return to sign in.
          </Link>
        </div>
      </Field>
    </form>
  );
}
