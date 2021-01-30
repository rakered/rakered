import { send } from '@rakered/email';

import { Context, EmailDoc } from '../types';
import createPasswordResetToken from './createPasswordResetToken';
import { createEnrollmentEmail } from '../email/enrollmentEmail';

/**
 * Send an email with a link that the user can use to set their initial password.
 */
async function sendEnrollmentEmail(
  identity: EmailDoc,
  context: Context,
): Promise<void> {
  const { token } = await createPasswordResetToken(identity, context);

  const options = {
    ...context.email,
    magicLink: context.urls.enrollAccount(token),
    to: identity.email,
  };

  const email = createEnrollmentEmail(options);
  return send(email);
}

export default sendEnrollmentEmail;
