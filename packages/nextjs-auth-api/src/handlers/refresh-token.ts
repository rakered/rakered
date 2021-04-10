import { NextApiRequest, NextApiResponse } from 'next';
import { setTokenCookies } from '../session/cookies';
import { Context } from '../auth';

/**
 * Refresh JWT tokens
 *
 * @param {string} req.cookies.accessToken The access token of the user
 * @param {string} req.cookies.refreshToken The refresh token of the user
 */
export async function handleTokenRefresh(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  const { accessToken, refreshToken } = req.cookies;

  const tokens = await ctx.accounts.refreshToken({ accessToken, refreshToken });
  setTokenCookies(res, tokens);

  res.status(200).json(tokens);
}
