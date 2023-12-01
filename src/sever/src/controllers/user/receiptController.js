const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Report } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");

const LOG_PATH = "user/receiptController";

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

const createReceipt = async (req, res) => {
  const {
    merchant_info,
    issued_at,
    total_amount,
    currency,
    country,
    category_id,
    expense_id,
    report_id,
  } = req.body;

  try {
    const receipt = new Receipt();
    receipt.category = category_id;
    receipt.expense = expense_id;
    receipt.merchant_info = merchant_info;
    receipt.issued_at = issued_at;
    receipt.total_amount = total_amount;
    receipt.currency = currency;
    receipt.country = country;

    receipt.save().then(async (savedReceipt) => {
      const existReport = await Report.findById(report_id);
      if (!existReport.receipt_ids.includes(savedReceipt._id)) {
        await Report.findByIdAndUpdate(report_id, {
          $push: { receipt_ids: savedReceipt._id },
        });
      }
      Receipt.findById(savedReceipt._id)
        .populate(REF_NAME.CATEGORY)
        .populate(REF_NAME.EXPENSE)
        .then((result) => {
          return response(res, { receipt: result }, {}, 200);
        });
    });
  } catch (error) {
    console.log(`${LOG_PATH}@createReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const updateReceipt = async (req, res) => {
  const { report_id, receipt_id } = req.body;
  const existReport = await Report.findById(report_id);
  if (!existReport.receipt_ids.includes(receipt_id)) {
    await Report.findByIdAndUpdate(report_id, {
      $push: { receipt_ids: receipt_id },
    });
  }
};

module.exports = {
  uploadReceipt,
  createReceipt,
  updateReceipt,
};
