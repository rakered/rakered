const common = require('../../jest.config');
module.exports = {
  ...common,
  setupFilesAfterEnv: [...common.setupFilesAfterEnv, './jest.setup.js'],
};
