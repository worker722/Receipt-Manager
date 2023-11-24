const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Category } = require("../../models/categoryModel");
const { Expense } = require("../../models/expenseModel");
const { response, fileManager } = require("../../utils");

const LOG_PATH = "user/receiptController";

const getAll = async (req, res) => {
  try {
    const receipts = await Receipt.find({})
      .populate(REF_NAME.CATEGORY)
      .populate(REF_NAME.EXPENSE)
      .exec();
    return response(res, { receipts }, {}, 200);
  } catch (error) {
    console.log(`${LOG_PATH}@getAll`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = (await Category.find({}).exec()) ?? [];
    return response(res, { categories }, {}, 200);
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ treatmented_at: 1 }).exec();
    return response(res, { expenses }, {}, 200);
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const uploadReceipt = () => {
  try {
    fileManager.receiptUploader(req, res, async function (_err) {
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
          return response(res, { file: req.file }, {}, 200);
        }
        response(res, {}, {}, 500, "Something went wrong!");
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@uploadReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  getAll,
  getExpenses,
  getCategories,
  uploadReceipt,
};
