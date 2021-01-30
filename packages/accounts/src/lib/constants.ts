export const ERROR_CODES = {
  DUPLICATE_KEY: 11000,
};

export const API_TOKEN_LENGTH = 40;

export const RESET_TOKEN_LENGTH = 40;
export const RESET_TOKEN_EXPIRY_SECONDS = 3600 * 24;

export const VERIFICATION_TOKEN_LENGTH = 40;

export const REFRESH_TOKEN_EXPIRY_SECONDS = 3600 * 24 * 7; // 7 days
export const REFRESH_TOKEN_LENGTH = 40;

export const ACCESS_TOKEN_EXPIRY_SECONDS = 3600 * 24; // 1 day
export const ACCESS_TOKEN_LENGTH = 40;

// chars @ chars . tld
export const EMAIL_REGEXP = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
