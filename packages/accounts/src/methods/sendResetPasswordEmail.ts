import { send } from '@rakered/email';
import { Context, EmailDoc } from '../types';
import createPasswordResetToken from './createPasswordResetToken';
import { createResetPasswordEmail } from '../email/resetPasswordEmail';

/**
 * Send an email with a link that the user can use to reset their password
 */
async function sendResetPasswordEmail(identity: EmailDoc, context: Context) {
  const { token } = await createPasswordResetToken(identity, context);

  const options = {
    ...context.email,
    magicLink: context.urls.resetPassword(token),
    to: identity.email,
  };

  const email = createResetPasswordEmail(options);
  return send(email);
}

export default sendResetPasswordEmail;
