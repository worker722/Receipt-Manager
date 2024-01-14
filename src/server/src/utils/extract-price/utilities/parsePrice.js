// @flow
const parseDecimalNumber = require("parse-decimal-number");

/**
 * @param format a two-character string consisting of the thousands character followed by the decimal point character, e.g. ',.'
 */
module.exports = (price, format) => {
  const value = Math.trunc(parseDecimalNumber(price, format) * 100);

  if (isNaN(value)) {
    throw new TypeError("Cannot extract price.");
  }

  return value;
};
