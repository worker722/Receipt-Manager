const Expense = require("@models/expenseModel");
const { response, fileUploader } = require("@utils");
const { faker } = require("@faker-js/faker");
var XLSX = require("xlsx");
const mongoose = require("mongoose");

const LOG_PATH = "staff/expensesController";

const getAll = async (req, res) => {
  try {
    const expenses = (await Expense.find({}).exec()) ?? [];
    return response(res, { expenses }, {}, 200);
  } catch (error) {
    console.log(`${LOG_PATH}@getAll`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createExpense = async (req, res) => {
  fileUploader.expenseUploader(req, res, async function (_err) {
    if (_err) {
      return response(
        res,
        {},
        _err,
        400,
        "File upload failed. Please try again."
      );
    } else {
      const workbook = XLSX.readFile(req.file.path);
      const sheet_name_list = workbook.SheetNames;
      const json_data = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      response(res, {file: req.file, expenses: json_data}, {}, 200);
    }
  });
};

const generateFakeData = async () => {
  try {
    await Expense.deleteMany({});

    var fakeData = [];
    for (let i = 0; i < 100; i++) {
      const newUser = {};
      newUser.started_at = new Date();
      newUser.ended_at = new Date();
      newUser.amount = faker.finance.amount();
      newUser.currency = faker.finance.currencyCode();
      newUser.location = faker.location.country();
      newUser.company = faker.company.name();
      newUser.merchant = faker.person.fullName();
      fakeData.push(newUser);
    }
    await Expense.insertMany(fakeData);
  } catch (error) {
    console.error(`${LOG_PATH}@generateFakeData`, error);
  }
};

module.exports = {
  getAll,
  createExpense,
};
