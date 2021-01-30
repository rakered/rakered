import blacklist from 'the-big-username-blacklist';

// - username may only contain alphanumeric characters and hyphens.
// - username cannot have multiple consecutive hyphens.
// - username cannot begin or end with a hyphen.
// - minimum length is 3 characters
// - maximum length is 20 characters.
export const USERNAME_REGEXP = /^(?=.{3,20}$)([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*)$/;

export const reserved = new Set(
  ['anonymous', 'own', 'webhook', 'webhooks', 'yourself'].concat(
    blacklist.list,
  ),
);

export function isReservedUsername(username) {
  return reserved.has((username || '').toLowerCase().trim());
}

export function isValidUsername(username) {
  return USERNAME_REGEXP.test(username || '');
}

export function normalizeUsername(str) {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
