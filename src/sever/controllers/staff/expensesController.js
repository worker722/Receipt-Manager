const Expense = require("../../models/expenseModel");
const { response } = require("../../utils");
const { faker } = require("@faker-js/faker");

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

const createExpense = async (req, res) => {};

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
