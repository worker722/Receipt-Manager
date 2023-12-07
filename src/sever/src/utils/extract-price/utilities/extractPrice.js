// @flow

const isCommaCentSeparatorNotation = require("./isCommaCentSeparatorNotation");
const isDotCentSeparatorNotation = require("./isDotCentSeparatorNotation");
const matchLongestAtLowest = require("./matchLongestAtLowest");
const normalizeInput = require("./normalizeInput");
const parsePrice = require("./parsePrice");

module.exports = (subject) => {
  const normalizedSubject = normalizeInput(subject);

  const formats = [
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP)?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))(?:\$|£|€|USD|EUR|GBP)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP)?(\d{1,3}(?:\.\d{3})*(?:,\d{2}))(?:\$|£|€|USD|EUR|GBP)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP)?(\d+)(?:\$|£|€|USD|EUR|GBP)?(?:\s|$|, |\. )/,
  ];

  const matches = [];

  const maybeLongestLowestMatch = matchLongestAtLowest(
    formats,
    normalizedSubject
  );

  if (maybeLongestLowestMatch) {
    // eslint-disable-next-line flowtype/no-weak-types
    const match = {};

    let amount;

    if (isCommaCentSeparatorNotation(maybeLongestLowestMatch.match)) {
      amount = parsePrice(maybeLongestLowestMatch.match, ".,");
    } else if (isDotCentSeparatorNotation(maybeLongestLowestMatch.match)) {
      amount = parsePrice(maybeLongestLowestMatch.match, ",.");
    } else {
      amount = parseInt(maybeLongestLowestMatch.match, 10) * 100;
    }

    match.amount = amount;

    const subjectBeforeMatch = subject.slice(0, maybeLongestLowestMatch.index);

    const beforeCurrencySymbolMatch = subjectBeforeMatch.match(/([$|£|€])\s?$/);

    if (beforeCurrencySymbolMatch) {
      match.currencySymbol = beforeCurrencySymbolMatch[1];
    } else {
      const beforeCurrencyCodeMatch = subjectBeforeMatch.match(
        /[\^|\s]((?:USD|EUR|GBP))\s?$/
      );

      if (beforeCurrencyCodeMatch) {
        match.currencyCode = beforeCurrencyCodeMatch[1];
      } else {
        const subjectAfterMatch = subject.slice(
          maybeLongestLowestMatch.match.length + maybeLongestLowestMatch.index
        );

        const afterCurrencySymbolMatch =
          subjectAfterMatch.match(/^\s?([$|£|€])/);

        if (afterCurrencySymbolMatch) {
          match.currencySymbol = afterCurrencySymbolMatch[1];
        } else {
          const afterCurrencyCodeMatch = subjectAfterMatch.match(
            /^\s?((?:USD|EUR|GBP))[,|;|$|\s]/
          );

          if (afterCurrencyCodeMatch) {
            match.currencyCode = afterCurrencyCodeMatch[1];
          }
        }
      }
    }

    matches.push(match);
  }

  return matches;
};
