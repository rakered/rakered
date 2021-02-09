import { isValidEmail, normalizeEmail } from '../lib/email';
import { Context } from '../types';
import { isDuplicateKeyError } from '@rakered/mongo/lib/utils';
import { UserInputError } from '@rakered/errors';

export interface addEmailDocument {
  userId: string;
  email: string;
  verified?: boolean;
}

async function addEmail(
  options: addEmailDocument,
  context: Context,
): Promise<void> {
  const { collection } = context;

  const email = normalizeEmail(options.email);

  if (!isValidEmail(email)) {
    throw new UserInputError('Email is invalid or already taken.');
  }

  const now = new Date();

  const doc: any = {
    address: email,
    verified: Boolean(options.verified),
  };

  try {
    const { modifiedCount } = await collection.updateOne(
      { _id: options.userId, 'emails.address': { $ne: email } },
      { $push: { emails: doc }, $set: { updatedAt: now } },
    );

    if (modifiedCount !== 1) {
      throw new UserInputError(
        'Incorrect userId provided or email already taken.',
      );
    }
  } catch (e) {
    if (isDuplicateKeyError(e, 'emails.address')) {
      throw new UserInputError(`Email is invalid or already taken.`);
    }

    /* istanbul ignore next */
    throw e;
  }
}

export default addEmail;
