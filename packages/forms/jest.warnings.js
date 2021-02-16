// jest.warnings.js
global.originalLogError = global.console.error;

global.console.error = (...args) => {
  /**
   * Avoid jsdom error message after submitting a form
   * https://github.com/jsdom/jsdom/issues/1937
   */
  const errorMessage = 'Not implemented: HTMLFormElement.prototype.submit';
  if (args && args[0].includes(errorMessage)) {
    return false;
  }

  global.originalLogError(...args);

  return true;
};
