import { SHA256 } from '../lib/password';
import { Context, AuthTokenResult } from '../types';
import { createTokens, verifyToken } from '../lib/jwt';

export type TokenDocument = { refreshToken: string; accessToken: string };

async function revokeToken(
  tokens: TokenDocument,
  { collection }: Context,
): Promise<void> {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('Incorrect token provided.');
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
    throw new Error('Incorrect token provided.');
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
    throw new Error('Incorrect token provided.');
  }
}

export default revokeToken;
