import { ReactElement } from 'react';
import Page from '../shared/page';
import Link from '../shared/link';
import {
  EnrollAccountForm,
  EnrollAccountFormProps,
} from '../forms/enroll-account-form';

export function EnrollAccountPage(props: EnrollAccountFormProps): ReactElement {
  return (
    <Page>
      <Page.Content>
        <Page.Title>Complete your registration</Page.Title>

        <EnrollAccountForm {...props} />
      </Page.Content>

      <Page.Footer>
        Have an account?{' '}
        <Link href="/auth/login" tabIndex={5}>
          <span className="font-medium">Sign in</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
