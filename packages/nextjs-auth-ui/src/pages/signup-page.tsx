import Link from '../shared/link';
import { ReactElement } from 'react';
import { SignupForm, SignupFormProps } from '../forms/signup-form';
import Page from '../shared/page';

export function SignupPage(props: SignupFormProps): ReactElement {
  return (
    <Page>
      <Page.Content>
        <Page.Title>Create your account</Page.Title>
        <SignupForm {...props} />
      </Page.Content>
      <Page.Footer>
        Have an account?{' '}
        <Link href={'/auth/login'} tabIndex={5}>
          <span className="font-medium">Sign in</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
