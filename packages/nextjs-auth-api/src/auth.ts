import { init, Options, Accounts } from '@rakered/accounts';
import type { NextApiRequest, NextApiResponse } from 'next';
import { handleLogin } from './handlers/login';
import { handleLogout } from './handlers/logout';
import { handleCreateAccount } from './handlers/create-account';
import { handleEnrollAccount } from './handlers/enroll-account';
import {
  handlePasswordReset,
  handlePasswordResetRequest,
} from './handlers/reset-password';
import {
  handleEmailVerification,
  handleEmailVerificationRequest,
} from './handlers/verify-email';
import { handleTokenRefresh } from './handlers/refresh-token';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'DELETE';

const wrap = (
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    ctx: Context,
  ) => Promise<unknown>,
  methods: Method[],
): ((
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
) => Promise<void>) => async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> => {
  if (!methods.includes((req.method as any)?.toUpperCase())) {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await fn(req, res, ctx);
  } catch (error) {
    console.error(error);
    res.status(error.code || 500).json({ message: error.message });
  }
};

export declare type NextApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  ctx: Context,
) => void | Promise<void>;

export interface Handlers {
  login: NextApiHandler;
  createAccount: NextApiHandler;
  logout: NextApiHandler;
  resetPassword: NextApiHandler;
  requestPasswordReset: NextApiHandler;
  verifyEmail: NextApiHandler;
  requestEmailVerification: NextApiHandler;
  enroll: NextApiHandler;
  onLogin?: Options['onLogin'];
}

const defaultHandlers = {
  login: wrap(handleLogin, ['POST']),
  logout: wrap(handleLogout, ['POST']),
  createAccount: wrap(handleCreateAccount, ['POST']),
  enrollAccount: wrap(handleEnrollAccount, ['POST']),
  resetPassword: wrap(handlePasswordReset, ['POST']),
  requestPasswordReset: wrap(handlePasswordResetRequest, ['POST']),
  verifyEmail: wrap(handleEmailVerification, ['POST']),
  requestEmailVerification: wrap(handleEmailVerificationRequest, ['POST']),
  refreshToken: wrap(handleTokenRefresh, ['POST']),
};

export interface Context {
  accounts: Accounts;
}

export function handleAuth(
  userHandlers?: Partial<Handlers>,
): NextApiHandler & { context: Context } {
  const handlers = {
    ...defaultHandlers,
    ...userHandlers,
  };

  const baseUrl = process.env.RAKERED_BASE_URL || process.env.BASE_URL;

  const accounts = init({
    onLogin: handlers.onLogin,
    urls: {
      verifyEmail: (token) => `${baseUrl}/auth/verify-email/${token}`,
      enrollAccount: (token) => `${baseUrl}/auth/enroll-account/${token}`,
      resetPassword: (token) => `${baseUrl}/auth/reset-password/${token}`,
    },
  });

  const context = { accounts };

  const handler = async (
    req: NextApiRequest,
    res: NextApiResponse,
  ): Promise<void> => {
    const { query, body } = req;
    const route = Array.isArray(query.slug) ? query.slug[0] : query.slug;

    switch (route) {
      case 'login': {
        return handlers.login(req, res, context);
      }

      case 'logout': {
        return handlers.logout(req, res, context);
      }

      // TODO: name create-account ? also it sends both a invite || enroll mail, should it?
      case 'create-account': {
        return handlers.createAccount(req, res, context);
      }

      // TODO: add create-invite ?

      case 'enroll-account': {
        return handlers.enrollAccount(req, res, context);
      }

      case 'reset-password': {
        return body.token
          ? handlers.resetPassword(req, res, context)
          : handlers.requestPasswordReset(req, res, context);
      }

      case 'verify-email': {
        return body.token
          ? handlers.verifyEmail(req, res, context)
          : handlers.requestEmailVerification(req, res, context);
      }

      case 'refresh-token': {
        return handlers.refreshToken(req, res, context);
      }

      default: {
        return res.status(404).json({ message: 'Not Found' });
      }
    }
  };

  handler.context = context;
  return handler;
}
