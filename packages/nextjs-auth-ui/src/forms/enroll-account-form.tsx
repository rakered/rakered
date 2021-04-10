import { Password } from '@rakered/accounts/lib/types';
import { handleSubmit } from '@rakered/forms';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { useStore } from '../store';
import Field from '../shared/field';
import Input from '../shared/input';
import Button from '../shared/button';
import { getError } from '../utils';
import { State } from '../types';

export type EnrollAccountFormProps = {
  token: string;
  onEnrollAccount?: ({ redirectTo }: { redirectTo: string }) => Promise<void>;
};

export type EnrollAccountFormData = { name: string; password: Password };

export function EnrollAccountForm({
  token,
  onEnrollAccount,
}: EnrollAccountFormProps): ReactElement {
  const router = useRouter();
  const redirectTo = router.query.redirect as string;

  const [state, setState] = useState<State<EnrollAccountFormData>>({
    status: 'idle',
  });

  const enroll = useStore((state) => state.enroll);

  const onSubmit = handleSubmit<{
    name: string;
    password: Password;
  }>(async (values) => {
    setState({ status: 'loading', values });
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        const res = await enroll({ ...state.values, token });
        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
      case 'success': {
        if (typeof onEnrollAccount === 'function') {
          await onEnrollAccount({ redirectTo });
        } else {
          await router.push(redirectTo || '/');
        }
        break;
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
          tabIndex={4}
          type="submit"
          color="blue"
          text="Complete registration"
          ariaText="Complete registration"
          ariaLoadingAlert="Completing registration"
          ariaSuccessAlert="Registration completed"
          ariaErrorAlert="Error while completing registration"
        />
      </Field>
    </form>
  );
}
