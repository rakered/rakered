import { send } from '@rakered/email';

import { Context, EmailDoc } from '../types';
import createEmailVerificationToken from './createEmailVerificationToken';
import { createVerificationEmail } from '../email/verificationEmail';

/**
 * Send an email with a link that the user can use verify their email address.
 */
async function sendVerificationEmail(
  identity: EmailDoc,
  context: Context,
): Promise<void> {
  const { token } = await createEmailVerificationToken(identity, context);

  const options = {
    ...context.email,
    magicLink: context.urls.verifyEmail(token),
    to: identity.email,
  };

  const email = createVerificationEmail(options);
  return send(email);
}

export default sendVerificationEmail;
