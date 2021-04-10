import { LoginForm, LoginFormProps } from '../forms/login-form';
import Link from '../shared/link';
import { ReactElement } from 'react';
import Page from '../shared/page';

export function LoginPage(props: LoginFormProps): ReactElement {
  return (
    <Page>
      <Page.Content>
        <Page.Title>Sign in to your account</Page.Title>
        <LoginForm {...props} />
      </Page.Content>
      <Page.Footer>
        Don't have an account?{' '}
        <Link href="/auth/signup" tabIndex={5}>
          <span className="font-medium">Sign up</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
