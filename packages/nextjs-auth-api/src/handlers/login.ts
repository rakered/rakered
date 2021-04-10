import { NextApiRequest, NextApiResponse } from 'next';
import { Context } from '../auth';
import { createUserResult, UserResult } from '../utils';
import { setTokenCookies } from '../session/cookies';

/**
 * Login
 *
 * @param {LoginDocument} req.body The user credentials
 */
export async function handleLogin(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<UserResult> {
  const tokens = await ctx.accounts.login(req.body);
  setTokenCookies(res, tokens);
  res.status(200).json(tokens);

  return createUserResult(tokens);
}
