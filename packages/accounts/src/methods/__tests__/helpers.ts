import init, { Accounts, defaultOptions } from '../../accounts';
import { CreateUserDocument } from '../createUser';

export async function initForTest(collection: string): Promise<Accounts> {
  return init({ collection: `test_${collection}` });
}

export function getTestContext(accounts: Accounts) {
  return {
    collection: accounts.collection,
    email: defaultOptions.email,
    urls: defaultOptions.urls,
  };
}

export const TEST_USER: CreateUserDocument = {
  username: 'AzureDiamond',
  email: 'hunter@example.com',
  password: 'hunter2',
};
