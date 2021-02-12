import { SHA256 } from '../lib/password';
import { Context, AuthTokenResult } from '../types';
import { createTokens, verifyToken } from '../lib/jwt';
import { UserInputError } from '@rakered/errors';
import {
  MAX_ACTIVE_REFRESH_TOKENS,
  REFRESH_TOKEN_MAX_EXPIRY_SECONDS,
} from '../lib/constants';

export type TokenDocument = { refreshToken: string; accessToken: string };

async function refreshToken(
  tokens: TokenDocument,
  { collection }: Context,
): Promise<AuthTokenResult> {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new UserInputError('Incorrect token provided.');
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
    throw new UserInputError('Incorrect token provided.');
  }

  const hashedToken = SHA256(tokens.refreshToken);

  const user = await collection.findOne({
    _id: currentRefreshToken._id,
    'services.resume.refreshTokens.token': hashedToken,
  });

  if (!user) {
    throw new UserInputError('Incorrect token provided.');
  }

  const expiresIn = currentRefreshToken.exp - Math.floor(Date.now() / 1000);

  // fail if the token is less than 5 seconds valid.
  if (expiresIn < 5) {
    throw new UserInputError('Incorrect token provided.');
  }

  const newTokens = createTokens(user, {
    refreshToken: { expiresIn },
  });

  const update = {
    when: new Date(),
    token: SHA256(newTokens.refreshToken),
  };

  // mongo cannot $pull and $push to the same target collection, as that
  // "would create conflict", so first we pull the existing token and expired
  // tokens out of the collection. And then push the new token back to the end,
  // while also removing all but the last 5 tokens.
  const minDate = new Date(
    Date.now() - REFRESH_TOKEN_MAX_EXPIRY_SECONDS * 1000,
  );

  const { modifiedCount } = await collection.updateOne(
    { _id: user._id },
    {
      $pull: {
        'services.resume.refreshTokens': {
          $or: [{ token: hashedToken }, { when: { $lte: minDate } }],
        },
      },
    },
  );

  // push the new token to the end, and remove all but last n refresh tokens
  await collection.updateOne(
    { _id: user._id },
    {
      $push: {
        'services.resume.refreshTokens': {
          $each: [update],
          $slice: -MAX_ACTIVE_REFRESH_TOKENS,
        },
      },
      $set: {
        updatedAt: update.when,
      },
    },
  );

  if (modifiedCount !== 1) {
    // possible when the user has been removed between retrieval and update
    /* istanbul ignore next */
    throw new UserInputError('Incorrect token provided');
  }

  return newTokens;
}

export default refreshToken;
