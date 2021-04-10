import { handleSubmit, HashedPassword } from '@rakered/forms';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';

import { useStore } from '../store';
import { State } from '../types';
import Field from '../shared/field';
import Input from '../shared/input';
import Button from '../shared/button';

export type ResetPasswordFormData = { password: HashedPassword };

export type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({
  token,
}: ResetPasswordFormProps): ReactElement {
  const router = useRouter();
  const resetPassword = useStore((state) => state.resetPassword);

  const [state, setState] = useState<State<ResetPasswordFormData>>({
    status: 'idle',
  });

  const onSubmit = handleSubmit<ResetPasswordFormData>(async (values) => {
    setState({ status: 'loading', values });
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        const res = await resetPassword({ ...state.values, token });
        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
      case 'success': {
        await router.push('/auth/login');
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state.status]);

  return (
    <form method="POST" onSubmit={onSubmit} className="w-full space-y-6">
      <p className="text-sm">
        Enter the new password that you'll wish to associate with account.{' '}
        <span className="font-medium">Please use a password manager</span>, if
        in any way possible.
      </p>
      <Field
        label="Password"
        error={'error' in state ? state.error : undefined}
      >
        <Input
          invalid={state.status === 'error'}
          tabIndex={1}
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
          tabIndex={2}
          type="submit"
          color="blue"
          text="Set Password"
          ariaText="Set passsword"
          ariaLoadingAlert="Changing password"
          ariaSuccessAlert="Pasword changed"
          ariaErrorAlert="Error while changing password"
        />
      </Field>
    </form>
  );
}
