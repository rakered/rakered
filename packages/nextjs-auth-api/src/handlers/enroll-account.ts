import { NextApiRequest, NextApiResponse } from 'next';
import { setTokenCookies } from '../session/cookies';
import { createUserResult, UserResult } from '../utils';
import { Context } from '../auth';

/**
 * Enroll
 *
 * @param {EnrollUserDocument} req.body The account data to enroll
 */
export async function handleEnrollAccount(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<UserResult> {
  const tokens = await ctx.accounts.enrollUser(req.body);
  await ctx.accounts.sendEnrollmentEmail(tokens.user);

  setTokenCookies(res, tokens);
  res.status(200).json(tokens);

  return createUserResult(tokens);
}
