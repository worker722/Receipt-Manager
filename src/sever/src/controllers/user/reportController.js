const {
  Receipt,
  REF_NAME: ReceiptRef,
  STATUS: RECEIPT_STATUS,
} = require("../../models/receiptModel");
const { Category } = require("../../models/categoryModel");
const { Expense } = require("../../models/expenseModel");
const {
  Report,
  REF_NAME: ReportRef,
  STATUS: REPORT_STATUS,
} = require("../../models/reportModel");
const { response, fileManager, currencySymbolMap } = require("../../utils");
const moment = require("moment");

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
        $match: {
          report: { $exists: false },
          $expr: { $eq: ["$assignee", { $toObjectId: req.currentUser._id }] },
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
    console.log(`${LOG_PATH}@getExpenses`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const getAllReports = async (req, res) => {
  try {
    Report.find({ reporter: req.currentUser._id })
      .sort({ status: 1 })
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

const getReport = async (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOne({ public_id })
      .populate(ReportRef.EXPENSE_IDS)
      .populate(ReportRef.RECEIPT_IDS)
      .then((report) => {
        var promisses = [];
        var receipt_ids = [];
        report.receipt_ids.forEach((_receipt) => {
          const promiss = new Promise((resolve, reject) => {
            _receipt.populate(ReceiptRef.CATEGORY).then((_newReceipt) => {
              receipt_ids.push(_newReceipt);
              resolve();
            });
          });
          promisses.push(promiss);
        });
        Promise.all(promisses).then(() => {
          report.receipt_ids = receipt_ids;
          return response(res, {
            report,
          });
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

const createReport = async (req, res) => {
  const { expense_ids = [] } = req.body;

  try {
    const newReport = new Report();
    newReport.expense_ids = expense_ids;
    newReport.public_id = 0;
    newReport.reporter = req.currentUser._id;

    newReport
      .save()
      .then(async (savedReport) => {
        await Expense.updateMany(
          { _id: { $in: expense_ids } },
          { $set: { report: savedReport._id } },
          { upsert: true }
        ).exec();

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

const matchReport = async (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOne({ public_id })
      .populate(ReportRef.EXPENSE_IDS)
      .populate(ReportRef.RECEIPT_IDS)
      .then((report) => {
        const expenses = report.expense_ids;
        const receipts = report.receipt_ids;

        var promisses = [];
        receipts.map((_receipt) => {
          expenses.map((_expense) => {
            const newPromiss = new Promise(async (resolve, reject) => {
              const matched = doMatch(_receipt, _expense);
              if (matched) {
                await Receipt.findByIdAndUpdate(
                  _receipt._id,
                  {
                    $set: {
                      expense: _expense._id,
                    },
                  },
                  {
                    new: true,
                  }
                );
                resolve();
              } else {
                resolve();
              }
            });
            promisses.push(newPromiss);
          });
        });
        Promise.all(promisses).then(() => {
          Report.findOne({ public_id })
            .populate(ReportRef.EXPENSE_IDS)
            .populate(ReportRef.RECEIPT_IDS)
            .then((report) => {
              promisses = [];
              var receipt_ids = [];
              report.receipt_ids.forEach((_receipt) => {
                const promiss = new Promise((resolve, reject) => {
                  _receipt.populate(ReceiptRef.CATEGORY).then((_newReceipt) => {
                    receipt_ids.push(_newReceipt);
                    resolve();
                  });
                });
                promisses.push(promiss);
              });
              Promise.all(promisses).then(() => {
                report.receipt_ids = receipt_ids;
                return response(res, {
                  report,
                });
              });
            })
            .catch((_error) => {
              console.log(`${LOG_PATH}@getReport`, _error);
              response(res, {}, _error, 500, "Something went wrong!");
            });
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

const doMatch = (receipt, expense) => {
  try {
    // Check merchant
    var merchantMatched = false;
    if (receipt.merchant_info == expense.trader_company_name)
      merchantMatched = true;

    // Check total amount
    var totalAmountMatched = false;
    var expense_amount_charged = expense.amount_charged
      ? expense.amount_charged.replace(",", ".")
      : "";
    var expense_total_amount_original_currency =
      expense.total_amount_original_currency
        ? expense.total_amount_original_currency.replace(",", ".")
        : "";
    try {
      if (
        parseFloat(receipt.total_amount) ==
          parseFloat(expense_amount_charged) ||
        parseFloat(receipt.total_amount) ==
          parseFloat(expense_total_amount_original_currency)
      )
        totalAmountMatched = true;
    } catch (error) {
      console.log(error);
    }

    // Check vat amount
    var vatAmountMatched = false;
    try {
      if (
        parseFloat(receipt.vat_amount_1) ==
          parseFloat(expense.commission_amount_1) ||
        parseFloat(receipt.vat_amount_2) ==
          parseFloat(expense.commission_amount_2) ||
        parseFloat(receipt.vat_amount_3) ==
          parseFloat(expense.commission_amount_3)
      )
        vatAmountMatched = true;
    } catch (error) {
      console.log(error);
    }

    // Check date matched
    var processDateMatched = false;
    const dateFormat = "YYYY-MM-DD";
    var receipt_issued_at = moment(receipt.issued_at).format(dateFormat);
    var expense_treatmented_at = moment(expense.treatmented_at).format(
      dateFormat
    );
    var expense_card_created_at = moment(expense.card_created_at).format(
      dateFormat
    );
    var expense_sold_at = moment(expense.sold_at).format(dateFormat);
    var expense_closed_at = moment(expense.closed_at).format(dateFormat);
    var expense_taken_into_account_at = moment(
      expense.taken_into_account_at
    ).format(dateFormat);
    if (
      receipt_issued_at == expense_treatmented_at ||
      receipt_issued_at == expense_card_created_at ||
      receipt_issued_at == expense_sold_at ||
      receipt_issued_at == expense_closed_at ||
      receipt_issued_at == expense_taken_into_account_at
    )
      processDateMatched = true;

    // Check currency
    var currencyMatched =
      receipt.currency.toUpperCase() ==
      expense.origin_currency_code.toUpperCase();
    if (!currencyMatched) {
      var receiptCurrency = currencySymbolMap._NONE;
      var currencySymbolMapKeys = Object.keys(currencySymbolMap);
      currencySymbolMapKeys.map((key) => {
        if (
          currencySymbolMap[key].code == receipt.currency ||
          currencySymbolMap[key].symbol_native == receipt.currency
        ) {
          receiptCurrency = currencySymbolMap[key];
          return;
        }
      });
      if (
        receiptCurrency.code == expense.origin_currency_code ||
        receiptCurrency.symbol_native == expense.origin_currency_code
      )
        currencyMatched = true;
    }

    // Check country
    var countryMatched = false;
    if (
      receipt.country_code == expense.operation_location_code ||
      receipt.country_code == expense.country_code
    )
      countryMatched = true;

    // Check city
    var cityMatched = false;
    if (receipt.city == expense.locality) cityMatched = true;

    /**************Check whole matching**************/
    /***********************************************/

    // If total amount and currency, date are correct, passed now;
    if (totalAmountMatched && currencyMatched && processDateMatched) {
      return true;
    }
    return false;
  } catch (_error) {
    console.log("matching error: ", _error);
    return false;
  }
};

const submitReport = (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOneAndUpdate(
      { public_id },
      {
        $set: {
          status: REPORT_STATUS.IN_REVIEW,
          reporter: req.currentUser._id,
        },
      },
      {
        $new: true,
      }
    )
      .then((updatedReport) => {
        var promisses = [];
        Report.findById(updatedReport._id)
          .populate(ReportRef.RECEIPT_IDS)
          .then((report) => {
            report.receipt_ids.map((_receipt) => {
              const newProimss = new Promise((resolve, reject) => {
                Receipt.findOneAndUpdate(
                  {
                    _id: _receipt._id,
                    status: {
                      $in: [
                        RECEIPT_STATUS.IN_PROGRESS,
                        RECEIPT_STATUS.REFUNDED,
                      ],
                    },
                  },
                  {
                    $set: {
                      status: RECEIPT_STATUS.PENDING,
                    },
                  },
                  {
                    $new: true,
                  }
                )
                  .then((updatedReceipt) => {
                    resolve();
                  })
                  .catch((_error) => {
                    reject();
                  });
              });
              promisses.push(newProimss);
            });
          });
        Promise.all(promisses).then(() => {
          return response(res, { report: updatedReport }, {}, 200);
        });
      })
      .catch((error) => {
        console.log(`${LOG_PATH}@submitReport`, error);
        response(res, {}, error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@submitReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  getExpenses,
  getCategories,
  getReport,
  getAllReports,
  createReport,
  matchReport,
  submitReport,
};
