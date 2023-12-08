const { Receipt, REF_NAME } = require("../../models/receiptModel");
const { Report } = require("../../models/reportModel");
const { response, fileManager } = require("../../utils");
const moment = require("moment");
const { createWorker } = require("tesseract.js");
const extractDate = require("../../utils/extract-date");
const extractPrice = require("../../utils/extract-price");
const currencySymbolMap = require("../../utils/currencySymbolMap");
const fs = require("node:fs");
const pdf2img = require("pdf-img-convert");

const LOG_PATH = "user/receiptController";

const uploadReceipt = (req, res) => {
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
          var imagePath = req?.file?.path;
          if (req.file.mimetype.includes("pdf")) {
            imagePath = await convertPDFtoImage(req.file.path);
            if (!imagePath) {
              return response(res, {}, {}, 500, "Something went wrong!");
            }
          }

          const result = await parseData(imagePath);
          return response(
            res,
            {
              data: result,
              originFile: {
                pdf: req.file.path,
                image: imagePath,
              },
            },
            {},
            200
          );
        }
        response(res, {}, {}, 500, "Something went wrong!");
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@uploadReceipt`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const convertPDFtoImage = async (path) => {
  try {
    var outputImages = await pdf2img.convert(path, {
      width: 600, //Number in px
      height: 900, // Number in px
      page_numbers: [1], // A list of pages to render instead of all of them
    });

    // From here, the images can be used for other stuff or just saved if that's required:
    if (outputImages.length > 0) {
      const imagePath =
        "./uploads/receipt/receipt_image_from_pdf_" + Date.now() + ".png";
      fs.writeFile(imagePath, outputImages[0], function (error) {
        if (error) {
          console.error("Error: " + error);
        }
      });

      return imagePath;
    }
    return false;
  } catch (error) {
    console.log(`${LOG_PATH}@convertPDFtoImage`, error);
    return false;
  }
};

// Parse data from image file using OCR
const parseData = async (imagePath) => {
  try {
    const worker = await createWorker("eng");
    const ret = await worker.recognize(imagePath);
    const procesedData = processData(ret.data);
    await worker.terminate();
    return procesedData;
  } catch (error) {
    console.log(`${LOG_PATH}@parseData`, error);
    return {};
  }
};

const processData = (data) => {
  try {
    const { text = "", lines = [] } = data;

    // Extract date
    const dates = extractDate(text);

    // Extract total price
    const totolPricesLine = lines
      .reverse()
      .find((_line) => _line.text.includes("Total") && /\d/.test(_line.text));

    var totalPrice;
    var currencyCode, currencySymbol;
    if (totolPricesLine && totolPricesLine?.text != "") {
      const extractPrices = extractPrice(totolPricesLine.text);
      if (extractPrices.length > 0) {
        totalPrice = extractPrices[0].amount;
        currencySymbol = extractPrices[0].currencySymbol;
        currencyCode = extractPrices[0].currencyCode;
      }
    }

    // Extract currency
    var currencySymbolMapKeys = Object.keys(currencySymbolMap);
    if (currencyCode || currencySymbol) {
      currencySymbolMapKeys.map((key) => {
        if (currencyCode) {
          if (currencyCode == currencySymbolMap[key].code) {
            currencySymbol = currencySymbolMap[key].symbol_native;
            return;
          }
        } else if (currencySymbol) {
          if (currencySymbol == currencySymbolMap[key].symbol_native) {
            currencyCode = currencySymbolMap[key].code;
            return;
          }
        }
      });
    }

    // If extractPrice module didn't get currency, will find manually from whole content
    if (!currencyCode && !currencySymbol) {
      currencySymbolMapKeys.map((key) => {
        if (
          text.includes(currencySymbolMap[key].code) ||
          text.includes(currencySymbolMap[key].symbol_native)
        ) {
          currencyCode = currencySymbolMap[key].code;
          currencySymbol = currencySymbolMap[key].symbol_native;
          return;
        }
      });
    }

    const result = {
      issued_at: dates.length > 0 ? dates[0].date : "",
      total_amount: totalPrice,
      currencyCode: currencyCode ? currencyCode : currencySymbolMap.EUR.code,
      currencySymbol: currencySymbol
        ? currencySymbol
        : currencySymbolMap.EUR.symbol_native,
      parsedData: data,
    };

    return result;
  } catch (error) {
    console.log(`${LOG_PATH}@processData`, error);
    return;
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
