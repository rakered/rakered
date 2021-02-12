export const API_TOKEN_LENGTH = 40;

/**
 * The default password reset token expiration period is 2 days (172_800 seconds).
 */
export const RESET_TOKEN_EXPIRY_SECONDS = 172_800; // 2 days

/**
 * The default refresh token expiration period is 30 days (2_592_000 seconds).
 * This can be configured up to 1 year (31_557_600 seconds). The lifetime does
 * not extend when tokens are rotated.
 */
export const REFRESH_TOKEN_EXPIRY_SECONDS = 2_592_000; // 30 days
export const REFRESH_TOKEN_MAX_EXPIRY_SECONDS = 31_557_600; // 1 year

/**
 * The default access token expiration period is 24 hours (86_400 seconds). This
 * can be configured up to 30 days (31_557_600 seconds).
 */
export const ACCESS_TOKEN_EXPIRY_SECONDS = 86_400; // 1 day
export const ACCESS_TOKEN_MAX_EXPIRY_SECONDS = 2_592_000; // 30 days

/**
 * The maximum number of active sessions a user can have. This is used to keep
 * the collection healthy, but also to keep the tokens safe. Realistically spoken
 * users have a notebook, phone, and maybe tablet. It's fine if logging in on
 * another device means that the oldest token is being revoked.
 */
export const MAX_ACTIVE_REFRESH_TOKENS = 5;
