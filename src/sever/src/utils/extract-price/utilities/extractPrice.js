// @flow

const isCommaCentSeparatorNotation = require("./isCommaCentSeparatorNotation");
const isDotCentSeparatorNotation = require("./isDotCentSeparatorNotation");
const matchLongestAtLowest = require("./matchLongestAtLowest");
const normalizeInput = require("./normalizeInput");
const parsePrice = require("./parsePrice");

module.exports = (subject) => {
  const normalizedSubject = normalizeInput(subject);

  const formats = [
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(\d{1,}(?:,\d{1,})*(?:\.\d{1,}))(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(\d{1,}(?:\.\d{1,}))(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(\d{1,})(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(\d{1,}(?:\.\d{1,})*(?:,\d{1}))(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(?:\s|$|, |\. )/,
    /(?:^|\s)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(\d+)(?:\$|£|€|USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD)?(?:\s|$|, |\. )/,
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

    // if (isCommaCentSeparatorNotation(maybeLongestLowestMatch.match)) {
    //   amount = parsePrice(maybeLongestLowestMatch.match, ".,");
    // } else if (isDotCentSeparatorNotation(maybeLongestLowestMatch.match)) {
    //   amount = parsePrice(maybeLongestLowestMatch.match, ",.");
    // } else {
    //   amount = parseInt(maybeLongestLowestMatch.match, 10) * 100;
    // }

    match.amount = maybeLongestLowestMatch.match;

    const subjectBeforeMatch = subject.slice(0, maybeLongestLowestMatch.index);

    const beforeCurrencySymbolMatch = subjectBeforeMatch.match(/([$|£|€])\s?$/);

    if (beforeCurrencySymbolMatch) {
      match.currencySymbol = beforeCurrencySymbolMatch[1];
    } else {
      const beforeCurrencyCodeMatch = subjectBeforeMatch.match(
        /[\^|\s]((?:USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD))\s?$/
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
            /^\s?((?:USD|EUR|GBP|JPY|CAD|AUD|CHF|HKD|KRW|NZD|PLN|SGD))[,|;|$|\s]/
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
