const { ExpenseFile } = require("../../models/expenseFileModel");
const { Expense, parseExpenses } = require("../../models/expenseModel");
const { response, fileManager } = require("../../utils");
const { faker } = require("@faker-js/faker");
var XLSX = require("xlsx");

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
  try {
    fileManager.expenseUploader(req, res, async function (_err) {
      if (_err) {
        return response(
          res,
          {},
          _err,
          400,
          "File upload failed. Please try again."
        );
      } else {
        if (req?.file?.path) {
          const expenseFile = new ExpenseFile();
          expenseFile.name = req.file.originalname;
          expenseFile.path = req.file.path;
          const newExpenseFile = await expenseFile.save();

          const workbook = XLSX.readFile(req.file.path);
          const sheet_name_list = workbook.SheetNames;
          const json_data_array = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
          );
          const parsedData = parseExpenses(json_data_array, newExpenseFile._id);
          const expenses = await Expense.insertMany(parsedData);
          return response(res, { expenses }, {}, 200);
        }
        response(res, {}, {}, 500, "Something went wrong!");
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@createExpense`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const generateFakeData = async () => {};

module.exports = {
  getAll,
  createExpense,
};
