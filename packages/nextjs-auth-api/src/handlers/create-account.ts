import { NextApiRequest, NextApiResponse } from 'next';
import { Context } from '../auth';
import { createUserResult, UserResult } from '../utils';
import { setTokenCookies } from '../session/cookies';

/**
 * Signup
 *
 * @param {CreateUserDocument|InviteUserDocument} req.body
 */
export async function handleCreateAccount(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<UserResult> {
  const tokens = await ctx.accounts.createUser(req.body);
  if ('accessToken' in tokens) {
    setTokenCookies(res, tokens);
  }

  if ('password' in req.body) {
    await ctx.accounts.sendVerificationEmail({ email: tokens.user.email });
  } else {
    await ctx.accounts.sendEnrollmentEmail({ email: tokens.user.email });
  }

  res.status(200).json(tokens);

  return createUserResult(tokens);
}
