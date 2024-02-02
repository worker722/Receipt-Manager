const { ExpenseFile } = require("../../models/expenseFileModel");
const { Expense, parseExpenses } = require("../../models/expenseModel");
const { User, REF_NAME } = require("../../models/userModel");
const Role = require("../../models/roleModel");
const { response, fileManager } = require("../../utils");
const XLSX = require("xlsx");
const { response, fileManager, currencySymbolMap } = require("../../utils");

const LOG_PATH = "staff/expensesController";

const getUsers = async (req, res) => {
  try {
    const users = await Role.aggregate([
      {
        $match: {
          name: "user",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "role",
          as: "userData",
        },
      },
    ]).exec();

    return response(res, { users }, {}, 200);
  } catch (error) {
    console.log(error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getAll = async (req, res) => {
  const { assignee_id } = req.body;
  try {
    const expenses = await Expense.aggregate([
      {
        $match: {
          $expr: { $eq: ["$assignee", { $toObjectId: assignee_id }] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$sold_at" },
            year: { $year: "$sold_at" },
          },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          filter: "$_id",
          data: 1,
        },
      },
      {
        $sort: {
          "filter.year": 1,
          "filter.month": 1,
        },
      },
    ]).exec();
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
          const { assignee_id } = req.body;
          const expenseFile = new ExpenseFile();
          expenseFile.name = req.file.originalname;
          expenseFile.path = req.file.path;
          const newExpenseFile = await expenseFile.save();

          const workbook = XLSX.readFile(req.file.path);
          const sheet_name_list = workbook.SheetNames;
          const json_data_array = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]],
            { blankrows: false }
          );
          if (json_data_array.length > 0) {
            const parsedData = parseExpenses(
              json_data_array,
              assignee_id,
              newExpenseFile._id
            );
            var correctData = [];

            const currencySymbolMapKeys = Object.keys(currencySymbolMap);
            parsedData.forEach((_item) => {
              // If currency code is ISO 4217 format numberic, convert to String Symbol
              if (
                !isNaN(_item.origin_currency_code) &&
                !isNaN(parseFloat(_item.origin_currency_code))
              ) {
                currencySymbolMapKeys.map((key) => {
                  if (
                    parseInt(currencySymbolMap[key].numeric) ==
                    parseInt(_item.origin_currency_code)
                  ) {
                    _item.origin_currency_code = currencySymbolMap[key].code;
                  }
                });
              }
              if (!_item.sold_at && _item.treatmented_at) {
                _item.sold_at = _item.treatmented_at;
              }
              if (_item.sold_at) correctData.push(_item);
            });
            const expenses = await Expense.insertMany(correctData);
            return response(res, { expenses }, {}, 200);
          }
          return response(res, { expenses: [] }, {}, 200);
        }
        response(res, {}, {}, 500, "Something went wrong!");
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@createExpense`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const clearNullDateExpenses = async () => {
  await Expense.deleteMany({ sold_at: null });
  return true;
};

module.exports = {
  getUsers,
  getAll,
  createExpense,
  clearNullDateExpenses,
};
