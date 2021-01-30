export const INDEXES = [
  [{ handle: 1 }, { unique: true, sparse: true, name: 'unique-handle' }],
  // please note, the `email.address` index works cross document, not within docs
  [
    { 'emails.address': 1 },
    { unique: true, sparse: true, name: 'unique-email-address' },
  ],
  [
    { 'services.api.tokens.hashedToken': 1 },
    { unique: true, sparse: true, name: 'unique-api-token' },
  ],
];
