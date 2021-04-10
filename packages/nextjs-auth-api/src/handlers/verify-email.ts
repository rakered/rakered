import { NextApiRequest, NextApiResponse } from 'next';
import { setTokenCookies } from '../session/cookies';
import { Context } from '../auth';

/**
 * Request verification email
 *
 * @param {EmailDoc} req.body The email to send an verification mail to
 */
export async function handleEmailVerificationRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  await ctx.accounts.sendVerificationEmail(req.body);
  res.status(200).json({ ok: true });
}

/**
 * Verify the email
 *
 *  @param {VerifyEmailDocument} req.body The token for the email to verify
 */
export async function handleEmailVerification(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: Context,
): Promise<void> {
  const tokens = await ctx.accounts.verifyEmail(req.body);
  setTokenCookies(res, tokens);
  res.status(200).json(tokens);
}
