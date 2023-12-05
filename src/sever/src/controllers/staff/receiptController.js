const { Receipt, REF_NAME, STATUS } = require("../../models/receiptModel");
const { Report, STATUS: REPORT_STATUS } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");
const moment = require("moment");

const LOG_PATH = "user/receiptController";

const approveReceipt = async (req, res) => {
  const { id } = req.body;

  try {
    await Receipt.findByIdAndUpdate(
      id,
      {
        $set: {
          status: STATUS.APPROVED,
        },
      },
      {
        new: true,
      }
    ).then((updatedReceipt) => {
      return response(res, { receipt: updatedReceipt }, {}, 200);
    });
  } catch (error) {
    console.log(`${LOG_PATH}@approveReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const refundReceipt = async (req, res) => {
  const { id, report_id } = req.body;

  try {
    await Report.findByIdAndUpdate(report_id, {
      $set: {
        status: REPORT_STATUS.REFUNDED,
      },
    }).exec();

    await Receipt.findByIdAndUpdate(
      id,
      {
        $set: {
          status: STATUS.REFUNDED,
        },
      },
      {
        new: true,
      }
    ).then((updatedReceipt) => {
      return response(res, { receipt: updatedReceipt }, {}, 200);
    });
  } catch (error) {
    console.log(`${LOG_PATH}@refundReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

module.exports = {
  approveReceipt,
  refundReceipt,
};
