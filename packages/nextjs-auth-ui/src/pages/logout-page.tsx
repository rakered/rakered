import { useStore } from '../store';
import { ReactElement, useEffect } from 'react';
import Link from '../shared/link';
import Page from '../shared/page';

export function LogoutPage(): ReactElement {
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    logout();
  }, []);

  return (
    <Page>
      <Page.Content>
        <Page.Title>Logout from your account</Page.Title>
        <div className="text-sm space-y-6 h-24">
          <p>You've been logged out. Feel free to close this tab.</p>
        </div>
      </Page.Content>
      <Page.Footer>
        Wish to go back?{' '}
        <Link href="/auth/login" tabIndex={5}>
          <span className="font-medium">Sign in</span>
        </Link>
      </Page.Footer>
    </Page>
  );
}
