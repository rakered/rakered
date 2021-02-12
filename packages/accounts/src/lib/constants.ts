export const API_TOKEN_LENGTH = 40;

export const RESET_TOKEN_EXPIRY_SECONDS = 3600 * 24;
export const REFRESH_TOKEN_EXPIRY_SECONDS = 3600 * 24 * 7; // 7 days
export const ACCESS_TOKEN_EXPIRY_SECONDS = 3600 * 24; // 1 day
export const REFRESH_TOKEN_MAX_EXPIRY_SECONDS = 31_557_600; // 1 year

/**
 * The maximum number of active sessions a user can have. This is used to keep
 * the collection healthy, but also to keep the tokens safe. Realistically spoken
 * users have a notebook, phone, and maybe tablet. It's fine if logging in on
 * another device means that the oldest token is being revoked.
 */
export const MAX_ACTIVE_REFRESH_TOKENS = 5;
