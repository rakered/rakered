import Page from '../shared/page';
import Link from '../shared/link';
import {
  ResetPasswordForm,
  ResetPasswordFormProps,
} from '../forms/reset-password-form';

export function ResetPasswordPage(props: ResetPasswordFormProps) {
  return (
    <Page>
      <Page.Content>
        <Page.Title>Reset your password</Page.Title>
        <ResetPasswordForm {...props} />
      </Page.Content>
      <Page.Footer>
        Remember your password?{' '}
        <Link href="/auth/login" tabIndex={5}>
          <span className="font-medium">Sign in</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
