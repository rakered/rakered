// {chars} @ {chars} . {chars}
export const EMAIL_REGEXP = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeEmail(str) {
  return (str || '').toLowerCase().trim();
}

export function isValidEmail(email) {
  return EMAIL_REGEXP.test(email || '');
}
