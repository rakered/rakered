import { useRouter } from 'next/router';
import { LoginFormProps } from './forms/login-form';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { SignupFormProps } from './forms/signup-form';

import { EnrollAccountPage } from './pages/enroll-account-page';
import { ForgotPasswordPage } from './pages/forgot-password-page';
import { LoginPage } from './pages/login-page';
import { LogoutPage } from './pages/logout-page';
import { ResetPasswordPage } from './pages/reset-password-page';
import { SignupPage } from './pages/signup-page';
import { VerifyEmailPage } from './pages/verify-email-page';

const pages: Record<string, ComponentType<any>> = {
  login: LoginPage,
  logout: LogoutPage,
  signup: SignupPage,
  'forgot-password': ForgotPasswordPage,
  'reset-password': ResetPasswordPage,
  'enroll-account': EnrollAccountPage,
  'verify-email': VerifyEmailPage,
};

export type AuthPagesProps = {
  logoUrl?: string;
  onLogin?: LoginFormProps['onLogin'];
  onSignup?: SignupFormProps['onSignup'];
  children?: ReactNode;
};

export function AuthPages({
  logoUrl,
  children,
  ...handlers
}: AuthPagesProps): ReactElement {
  const router = useRouter();
  const { query, isReady } = router;
  const [handler, token] = query.slug || [];

  const Page = pages[handler];

  if (!isReady) {
    return (
      <div className="relative h-screen w-screen bg-gray-50 flex flex-col overflow-y-auto" />
    );
  }

  if (!Page) {
    return (
      <div className="relative h-screen w-screen bg-gray-50 flex items-center justify-center">
        <h1 className="flex items-center h-14 border-r border-gray-300 pr-4 mr-4 text-2xl font-med font-medium align-top">
          404
        </h1>
        <h2 className="text-sm">This page could not be found.</h2>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-gray-50 flex flex-col overflow-y-auto">
      {children}
      <main className="min-h-0 relative z-10 flex flex-col w-full space-y-8 pt-12 flex-0 px-4 sm:pt-32 sm:max-w-2xl mx-auto">
        <nav className="flex-none h-8 text-white flex items-stretch justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push('/');
              return false;
            }}
            className="inline-flex items-center rounded focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300"
          >
            <img className="h-12" src={logoUrl} />
          </a>
        </nav>
        <Page {...handlers} token={token} />
      </main>
    </div>
  );
}
