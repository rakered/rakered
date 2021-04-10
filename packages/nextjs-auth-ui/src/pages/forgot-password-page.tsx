import Link from '../shared/link';
import Page from '../shared/page';
import { ForgotPasswordForm } from '../forms/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <Page>
      <Page.Content>
        <Page.Title>Recover your account</Page.Title>
        <ForgotPasswordForm />
      </Page.Content>
      <Page.Footer>
        Don't have an account?{' '}
        <Link href="/auth/signup" tabIndex={4}>
          <span className="font-medium">Sign up</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
