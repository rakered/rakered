import { SHA256 } from '../lib/password';
import { Context } from '../types';
import { verifyToken } from '../lib/jwt';
import { UserInputError } from '@rakered/errors';

export type TokenDocument = { refreshToken: string; accessToken: string };

async function revokeToken(
  tokens: TokenDocument,
  { collection }: Context,
): Promise<void> {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new UserInputError('Incorrect token provided.');
  }

  const currentRefreshToken = verifyToken(tokens.refreshToken);
  const currentAccessToken = verifyToken(tokens.accessToken);

  // we don't check prime here, instead we check userId. It should be possible
  // for users to remove old tokens, when already using newer access tokens.
  if (
    !currentAccessToken ||
    !currentRefreshToken ||
    currentAccessToken._id !== currentRefreshToken._id
  ) {
    throw new UserInputError('Incorrect token provided.');
  }

  const hashedToken = SHA256(tokens.refreshToken);

  const { modifiedCount } = await collection.updateOne(
    {
      _id: currentRefreshToken._id,
      'services.resume.refreshTokens.token': hashedToken,
    },
    { $pull: { 'services.resume.refreshTokens': { token: hashedToken } } },
  );

  if (modifiedCount !== 1) {
    throw new UserInputError('Incorrect token provided.');
  }
}

export default revokeToken;
