// @flow

module.exports = (subject) => {
  return /(?:,\d{2}$)|(?:\d+(\.\d{3})+)/.test(subject);
};
