import { CookieSerializeOptions, parse, serialize } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from '@rakered/accounts/lib/lib/constants';

const isSecureUrl = (
  process.env.RAKERED_BASE_URL || process.env.BASE_URL
)?.startsWith('https');

export const getAllCookies = (
  req: IncomingMessage,
): { [key: string]: string } => {
  return parse(req.headers.cookie || '');
};

export const getCookie = (req: IncomingMessage, name: string): string => {
  const cookies = getAllCookies(req);
  return cookies[name];
};

export const setCookie = (
  res: ServerResponse,
  name: string,
  value: string,
  options: CookieSerializeOptions = {},
): void => {
  const strCookie = serialize(name, value, options);

  let previousCookies = res.getHeader('Set-Cookie') || [];
  if (!Array.isArray(previousCookies)) {
    previousCookies = [previousCookies as string];
  }

  res.setHeader('Set-Cookie', [...previousCookies, strCookie]);
};

export const clearCookie = (
  res: ServerResponse,
  name: string,
  options: CookieSerializeOptions = {},
): void => {
  setCookie(res, name, '', { ...options, maxAge: 0 });
};

export function setTokenCookies(
  res: ServerResponse,
  {
    accessToken,
    refreshToken,
  }: { accessToken: string | null; refreshToken: string | null },
): void {
  const options: Partial<CookieSerializeOptions> = {
    httpOnly: true,
    secure: isSecureUrl,
    sameSite: 'lax',
  };

  // add a cookie handler to the response object
  setCookie(res, 'accessToken', accessToken || '', {
    ...options,
    path: '/',
    maxAge: accessToken ? ACCESS_TOKEN_EXPIRY_SECONDS : 0,
  });

  ['/api/auth/logout', '/api/auth/refresh-token'].map((path) => {
    setCookie(res, 'refreshToken', refreshToken || '', {
      ...options,
      path,
      maxAge: refreshToken ? REFRESH_TOKEN_EXPIRY_SECONDS : 0,
    });
  });
}
