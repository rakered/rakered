import { SHA256 } from '../lib/password';
import { Context, AuthTokenResult } from '../types';
import { createTokens, verifyToken } from '../lib/jwt';

export type TokenDocument = { refreshToken: string; accessToken: string };

async function refreshToken(
  tokens: TokenDocument,
  { collection }: Context,
): Promise<AuthTokenResult> {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('Incorrect token provided.');
  }

  const currentRefreshToken = verifyToken(tokens.refreshToken);
  const currentAccessToken = verifyToken(tokens.accessToken, {
    ignoreExpiration: true,
  });

  if (
    !currentAccessToken ||
    !currentRefreshToken ||
    currentRefreshToken.prm !== currentAccessToken.prm
  ) {
    throw new Error('Incorrect token provided.');
  }

  const hashedToken = SHA256(tokens.refreshToken);

  const user = await collection.findOne({
    _id: currentRefreshToken._id,
    'services.resume.refreshTokens.token': hashedToken,
  });

  if (!user) {
    throw new Error('Incorrect token provided.');
  }

  const newTokens = createTokens(user);
  const update = {
    when: new Date(),
    token: SHA256(newTokens.refreshToken),
  };

  // mongo cannot $pull and $push to the same target collection, as that
  // "would create conflict", so we replace the document with a $set op instead
  const { modifiedCount } = await collection.updateOne(
    { _id: user._id, 'services.resume.refreshTokens.token': hashedToken },
    {
      $set: {
        updatedAt: update.when,
        'services.resume.refreshTokens.$': update,
      },
    },
  );

  if (modifiedCount !== 1) {
    // possible when the user has been removed between retrieval and update
    /* istanbul ignore next */
    throw new Error('Incorrect token provided');
  }

  return newTokens;
}

export default refreshToken;
