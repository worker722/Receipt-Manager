const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Report } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");
const moment = require("moment");
const { createWorker } = require("tesseract.js");
const extractDate = require("extract-date");
const extractPrice = require("extract-price");

const LOG_PATH = "user/receiptController";

const uploadReceipt = (req, res) => {
  console.log(extractPrice.default("extracts currency symbols $2.00"));
  console.log(extractPrice.default("Total-EFT USD1485"));
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
          // console.log(
          //   extractDate("0044180 0011206 007 0031 12.10.2022 06:48:0")
          // );
          const result = await parseData(req?.file?.path);
          return response(res, { file: result }, {}, 200);
        }
        response(res, {}, {}, 500, "Something went wrong!");
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@uploadReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

// Parse data from image file using OCR
const parseData = async (imagePath) => {
  try {
    const worker = await createWorker("eng");
    const ret = await worker.recognize(imagePath);
    await worker.terminate();
    return ret.data.lines;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

const createReceipt = async (req, res) => {
  const {
    merchant_info,
    issued_at,
    total_amount,
    currency,
    country_code,
    category_id,
    report_id,
  } = req.body;

  try {
    const receipt = new Receipt();
    receipt.category = category_id;
    receipt.merchant_info = merchant_info;
    receipt.issued_at = moment(issued_at).format("YYYY-MM-DD");
    receipt.total_amount = total_amount;
    receipt.currency = currency.toUpperCase();
    receipt.country_code = country_code.toUpperCase();

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
  const { id, merchant_info, issued_at, total_amount, currency, country_code } =
    req.body;

  try {
    await Receipt.findByIdAndUpdate(
      id,
      {
        $set: {
          merchant_info,
          issued_at: moment(issued_at).format("YYYY-MM-DD"),
          total_amount,
          currency,
          country_code,
        },
      },
      {
        new: true,
      }
    ).then((updatedReceipt) => {
      return response(res, { receipt: updatedReceipt }, {}, 200);
    });
  } catch (error) {
    console.log(`${LOG_PATH}@updateReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const deleteReceipt = async (req, res) => {
  const { id } = req.body;

  try {
    await Receipt.findByIdAndUpdate(
      id,
      {
        $set: {
          deleted_at: new Date(),
        },
      },
      {
        new: true,
      }
    ).exec();
    return response(res, {}, {}, 200);
  } catch (error) {
    console.log(`${LOG_PATH}@deleteReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  uploadReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
};
