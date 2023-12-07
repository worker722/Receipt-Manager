// @flow

const moment = require("moment-timezone");
const dictionary = require("relative-date-names");

module.exports = (subject, locale, timezone) => {
  const translation = dictionary[locale];

  if (!translation) {
    throw new Error("No translation available for the target locale.");
  }

  if (!moment.tz.zone(timezone)) {
    throw new Error("Unrecognized timezone.");
  }

  const normalizedSubject = subject.toLowerCase();

  const now = moment();

  if (normalizedSubject === translation.day.relative.yesterday) {
    return now.subtract(1, "day").format("YYYY-MM-DD");
  }

  if (normalizedSubject === translation.day.relative.today) {
    return now.format("YYYY-MM-DD");
  }

  if (normalizedSubject === translation.day.relative.tomorrow) {
    return now.add(1, "day").format("YYYY-MM-DD");
  }

  return null;
};
