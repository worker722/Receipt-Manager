// @flow

module.exports = (d) => {
  var day, month, year;
  var matched = false;

  // DD-./MM-./YYYY
  result = d.match("[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}");
  if (null != result) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[0];
    month = dateSplitted[1];
    year = dateSplitted[2];

    matched = true;
  }
  // D-./MM-./YYYY
  result = d.match("[0-9]{1}([-/ .])[0-9]{2}[-/ .][0-9]{4}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[0];
    month = dateSplitted[1];
    year = dateSplitted[2];

    matched = true;
  }
  // D-./M-./YYYY
  result = d.match("[0-9]{1}([-/ .])[0-9]{1}[-/ .][0-9]{4}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[0];
    month = dateSplitted[1];
    year = dateSplitted[2];

    matched = true;
  }
  // DD-./M-./YYYY
  result = d.match("[0-9]{2}([-/ .])[0-9]{1}[-/ .][0-9]{4}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[0];
    month = dateSplitted[1];
    year = dateSplitted[2];

    matched = true;
  }

  // YYYY-./MM-./DD
  result = d.match("[0-9]{4}([-/ .])[0-9]{2}[-/ .][0-9]{2}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[2];
    month = dateSplitted[1];
    year = dateSplitted[0];

    matched = true;
  }
  // YYYY-./MM-./D
  result = d.match("[0-9]{4}([-/ .])[0-9]{2}[-/ .][0-9]{1}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[2];
    month = dateSplitted[1];
    year = dateSplitted[0];

    matched = true;
  }
  // YYYY-./M-./D
  result = d.match("[0-9]{4}([-/ .])[0-9]{1}[-/ .][0-9]{1}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[2];
    month = dateSplitted[1];
    year = dateSplitted[0];

    matched = true;
  }
  // YYYY-./M-./DD
  result = d.match("[0-9]{4}([-/ .])[0-9]{1}[-/ .][0-9]{1}");
  if (null != result && !matched) {
    dateSplitted = result[0].split(result[1]);
    day = dateSplitted[2];
    month = dateSplitted[1];
    year = dateSplitted[0];

    matched = true;
  }

  if (month > 12) {
    aux = day;
    day = month;
    month = aux;
  }

  if (!year || !month || !day) {
    return false;
  }

  return year + "-" + processDayMonth(month) + "-" + processDayMonth(day);
};

const processDayMonth = (value) => {
  if (!value || value.includes("0")) return value;
  if (parseInt(value) < 10) return `0${value}`;
  return value;
};
