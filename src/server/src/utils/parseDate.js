module.exports = parseData = (value) => {
  const regExps = [
    /\d{2}.\d{2}.\d{4}/, // MM.DD.YYYY 12.01.1990
    /\d{4}-\d{2}-\d{2}/, // YYYY.MM.DD 1990.12.01
    /\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY 12-01-1990
    /\d{4}.\d{2}.\d{2}/, // YYYY-MM-DD 1990-12-01
    /\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD 1990/12/01
    /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY 01/12/1990
    /\d{4}\d{2}\d{2}/, // YYYYMMDD 19901201
    /\d{2}-[A-Za-z]{3}-\d{4}/, // DD-MMM-YYYY 01-Dec-1990
  ];

  // Other types are not-empty
  return false;
};
