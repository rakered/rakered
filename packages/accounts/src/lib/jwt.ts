import picoid from 'picoid';
import jwt from 'jsonwebtoken';
import { AuthTokenResult, User, UserDocument } from '../types';
import { compact } from './compact';
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  ACCESS_TOKEN_MAX_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_MAX_EXPIRY_SECONDS,
} from './constants';

interface TokenOptions {
  refreshToken: { expiresIn: number };
  accessToken: { expiresIn: number };
}

function min(...nums: (number | undefined)[]) {
  return Math.min(
    ...nums.filter<number>((x): x is number => typeof x !== 'undefined'),
  );
}

export function createTokens(
  document: UserDocument,
  options?: Partial<TokenOptions>,
): AuthTokenResult {
  const user = compact({
    _id: document._id,
    username: document.username,
    email: document.emails?.[0]?.address,
    name: document.name,
    roles: (document.roles || []).filter(Boolean),
  }) as User;

  const secret = process.env.JWT_SECRET || 'hunter2';

  const data = {
    ...user,
    sub: user._id,
    prm: picoid(), // prime is used to tie request and refresh token together
  };

  const refreshToken = jwt.sign(data, secret, {
    expiresIn: min(
      options?.refreshToken?.expiresIn || REFRESH_TOKEN_EXPIRY_SECONDS,
      REFRESH_TOKEN_EXPIRY_SECONDS,
    ),
  });

  const accessToken = jwt.sign(data, secret, {
    expiresIn: min(
      options?.accessToken?.expiresIn || ACCESS_TOKEN_EXPIRY_SECONDS,
      ACCESS_TOKEN_EXPIRY_SECONDS,
    ),
  });

  return {
    user,
    refreshToken,
    accessToken,
  };
}

export interface TokenPayload {
  _id: string;
  username?: string;
  email?: string;
  roles: string[];
  prm: string;
  iat: number;
  exp: number;
}

export function verifyToken(
  token: string,
  options?: { ignoreExpiration?: boolean },
): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'hunter2', options);
  } catch (ex) {
    return null;
  }
}
