import { isValidEmail, normalizeEmail } from '../lib/email';
import { Context } from '../types';
import { UserInputError } from '@rakered/errors';

export interface removeEmailDocument {
  userId: string;
  email: string;
  verified?: boolean;
  primary?: boolean;
}

async function removeEmail(
  options: removeEmailDocument,
  context: Context,
): Promise<void> {
  const { collection } = context;

  const email = normalizeEmail(options.email);

  if (!isValidEmail(email)) {
    throw new UserInputError('Email is invalid.');
  }

  const now = new Date();

  const { modifiedCount } = await collection.updateOne(
    {
      _id: options.userId,
      'emails.address': email,
      // make sure that either 1 email address remains, or that the username is set
      // we can't leave users hanging without an option to login.
      $or: [{ 'emails.1': { $exists: true } }, { username: { $exists: true } }],
    },
    { $pull: { emails: { address: email } }, $set: { updatedAt: now } },
  );

  if (modifiedCount !== 1) {
    throw new UserInputError('Incorrect userId provided or email is unknown.');
  }
}

export default removeEmail;
