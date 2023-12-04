const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Report } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");
const moment = require("moment");

const LOG_PATH = "user/receiptController";

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

module.exports = {
  updateReceipt,
};
