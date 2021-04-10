import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store';
import Page from '../shared/page';
import { State } from '../types';

export type VerifyEmailPageProps = {
  token: string;
};

export function VerifyEmailPage({ token }: VerifyEmailPageProps): ReactElement {
  const router = useRouter();
  const verifyEmail = useStore((state) => state.verifyEmail);

  const [state, setState] = useState<State>({
    status: 'loading',
    values: undefined,
  });

  const transition = async () => {
    switch (state.status) {
      case 'loading': {
        const res = await verifyEmail({ token });
        if ('error' in res) {
          setState({ ...state, status: 'error', error: res.error });
        } else {
          setState({ status: 'success' });
        }
        break;
      }
      case 'success': {
        router.push('/auth/login');
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state.status]);

  return (
    <Page>
      <Page.Content>
        <Page.Title>
          {state.status === 'error' ? 'Oops' : 'Verifying Email'}
        </Page.Title>
        <p className="text-sm">
          {state.status === 'error' ? state.error : 'please give us a second'}
        </p>
      </Page.Content>
    </Page>
  );
}
