import { NextApiRequest, NextApiResponse } from 'next';
import { setTokenCookies } from '../session/cookies';
import { Context } from '../auth';

/**
 * Logout
 *
 * @param {string} req.cookies.accessToken The access token of the user
 * @param {string} req.cookies.refreshToken The refresh token that should be invalidated
 */
export async function handleLogout(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  const { accessToken, refreshToken } = req.cookies;

  if (accessToken && refreshToken) {
    await ctx.accounts.revokeToken({ accessToken, refreshToken });
  }

  setTokenCookies(res, {
    accessToken: null,
    refreshToken: null,
  });

  res.status(200).json({ ok: true });
}
