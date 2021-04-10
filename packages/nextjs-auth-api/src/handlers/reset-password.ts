import { NextApiRequest, NextApiResponse } from 'next';
import { setTokenCookies } from '../session/cookies';
import { Context } from '../auth';

/**
 * Request an email with token to reset password
 *
 * @param {EmailDoc} req.body The email address to send a password reset mail to
 */
export async function handlePasswordResetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  await ctx.accounts.sendResetPasswordEmail(req.body);
  res.status(200).json({ ok: true });
}

/**
 * Reset password
 *
 * @param {ResetPasswordDocument} req.body The token and new password to reset
 */
export async function handlePasswordReset(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  const tokens = await ctx.accounts.resetPassword(req.body);
  setTokenCookies(res, tokens);
  res.status(200).json(tokens);
}
