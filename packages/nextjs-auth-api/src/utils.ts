import { AuthTokenResult } from '@rakered/accounts';
import { InviteUserResult } from '@rakered/accounts/lib/types';

export function createUserResult(
  tokens: AuthTokenResult | InviteUserResult,
): UserResult {
  return { user: { _id: tokens.user._id, email: tokens.user.email } };
}

export type UserResult = {
  user: Pick<InviteUserResult['user'], '_id' | 'email'>;
};
