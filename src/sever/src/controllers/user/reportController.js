const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Category } = require("../../models/categoryModel");
const { Expense } = require("../../models/expenseModel");
const { Report, REF_NAME: ReportRef } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");

const LOG_PATH = "user/reportController";

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
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$treatmented_at" },
            year: { $year: "$treatmented_at" },
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
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getAllReports = async (req, res) => {
  try {
    Report.find()
      .populate(ReportRef.EXPENSE_IDS)
      .populate(ReportRef.RECEIPT_IDS)
      .then((reports) => {
        return response(res, {
          reports,
        });
      })
      .catch((_error) => {
        console.log(`${LOG_PATH}@getAllReports`, _error);
        response(res, {}, _error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@getAllReports`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createReport = async (req, res) => {
  const { expense_ids = [] } = req.body;

  try {
    const newReport = new Report();
    newReport.expense_ids = expense_ids;
    newReport.public_id = 0;

    newReport
      .save()
      .then(async (savedReport) => {
        return response(res, {
          report: savedReport,
        });
      })
      .catch((_error) => {
        console.log(`${LOG_PATH}@createReport`, _error);
        response(res, {}, _error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@createReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getReport = async (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOne({ public_id })
      .populate(ReportRef.EXPENSE_IDS)
      .populate(ReportRef.RECEIPT_IDS)
      .then((report) => {
        return response(res, {
          report,
        });
      })
      .catch((_error) => {
        console.log(`${LOG_PATH}@getReport`, _error);
        response(res, {}, _error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@getReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  getExpenses,
  getCategories,
  createReport,
  getReport,
  getAllReports,
};
