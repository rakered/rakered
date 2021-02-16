module.exports = {
  ...require('../../jest.config'),
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.warnings.js'],
};
