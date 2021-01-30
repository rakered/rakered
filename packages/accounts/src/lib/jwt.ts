import picoid from 'picoid';
import jwt from 'jsonwebtoken';
import { AuthTokenResult, User, UserDocument } from '../types';
import { compact } from './compact';
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from './constants';

// Note, the `accessToken` is the one stored in cookies, the `refreshToken` is not.
// because the accessToken is needed by the server (`req.headers.authorization`) to
// grant access. Refresh token is used explictly to refresh the token
export function createTokens(document: UserDocument): AuthTokenResult {
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
    prm: picoid(), // prime is used to tie request and refresh token together
  };

  const refreshToken = jwt.sign(data, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
  });

  const accessToken = jwt.sign(data, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
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
