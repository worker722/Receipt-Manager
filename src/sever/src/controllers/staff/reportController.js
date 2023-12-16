const { REF_NAME: ReceiptRef } = require("../../models/receiptModel");
const {
  Report,
  REF_NAME: ReportRef,
  STATUS: REPORT_STATUS,
} = require("../../models/reportModel");
const { response } = require("../../utils");

const LOG_PATH = "user/reportController";

const getAllReports = async (req, res) => {
  try {
    Report.find({
      status: { $nin: [REPORT_STATUS.IN_PROGRESS, REPORT_STATUS.CLOSED] },
    })
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

const approveReport = (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOneAndUpdate(
      { public_id },
      {
        $set: {
          status: REPORT_STATUS.ACCEPTED,
        },
      },
      {
        $new: true,
      }
    )
      .then((updatedReport) => {
        return response(res, { report: updatedReport }, {}, 200);
      })
      .catch((error) => {
        console.log(`${LOG_PATH}@approveReport`, error);
        response(res, {}, error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@approveReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  getReport,
  getAllReports,
  approveReport,
};
