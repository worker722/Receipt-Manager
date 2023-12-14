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

const convertImage = (imageSrc) => {
  const data = atob(imageSrc.split(",")[1])
    .split("")
    .map((c) => c.charCodeAt(0));

  return new Uint8Array(data);
};

// Parse data from image file using OCR
const parseData = async (imagePath) => {
  try {
    const worker = await createWorker("eng");
    const ret = await worker.recognize(
      imagePath
      // { rotateAuto: true },
      // { imageColor: true, imageGrey: true, imageBinary: true }
    );

    // const { imageColor, imageGrey, imageBinary } = ret.data;

    // fs.writeFileSync("imageColor.png", convertImage(imageColor));
    // fs.writeFileSync("imageGrey.png", convertImage(imageGrey));
    // fs.writeFileSync("imageBinary.png", convertImage(imageBinary));

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
    var issuedDate;
    if (dates && dates.length > 0) {
      var _realDate = moment(dates[0].date);
      var _year = _realDate.year();
      if (_year < 1900) {
        _year += 2000;
        _realDate.set("year", _year);
      }
      issuedDate = _realDate.format("YYYY-MM-DD");
    }

    var totalPrice = 0.0;
    var vatPrice = 0.0;
    var vatAmount = 0.0;

    // Extract total price
    const reversedLines = lines.reverse();
    const totolPricesLine = reversedLines.find((_line) => {
      if (
        _line.text.toLowerCase().includes("total") &&
        !_line.text.toLowerCase().includes("sub")
      ) {
        var prices = [];
        const subjects = _line.text.split(" ");
        subjects.forEach((_subject) => {
          _subject = _subject.replace(",", ".");
          let numbers = _subject.match(/[0-9.]+/g);
          numbers &&
            numbers.forEach((_number) => {
              prices.push(parseFloat(_number));
            });
        });
        if (prices.length > 0) {
          prices.sort((a, b) => b - a);
          totalPrice = prices[0];

          // if total price line has vat amount also, it will be extracted;
          if (prices.length > 2) vatPrice = prices.pop();

          return true;
        }
      }
    });

    // Extract currency with third-party module
    var currencyCode, currencySymbol;
    if (!totalPrice && totolPricesLine && totolPricesLine?.text != "") {
      const extractPrices = extractPrice(totolPricesLine.text);
      if (extractPrices.length > 0) {
        totalPrice = extractPrices[0].amount;
        currencySymbol = extractPrices[0].currencySymbol;
        currencyCode = extractPrices[0].currencyCode;
      }
    }

    // Extract currency manually
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

    // Extract vat amount
    const vatTextArray = ["vat", "tva", "tax", "impot", "impôt", "%", "§"]; // must be lowercase letters

    var vatLines = [];
    lines.forEach((_line) => {
      vatTextArray.forEach((_item) => {
        if (
          _line.text.toLowerCase().includes(_item) &&
          !_line.text.toLowerCase().includes("taxi") &&
          !_line.text.toLowerCase().includes("id") &&
          !_line.text.toLowerCase().includes("no")
        ) {
          if (
            (_line.text.toLowerCase().match(new RegExp(_item, "g")) || [])
              .length != 1
          )
            return;
          if (_item != "%" && _item != "§") {
            const regStr = `\\b${_item}\\b`;
            const regex = new RegExp(regStr, "g");
            const newstr = _line.text.toLowerCase().match(regex);
            if (!newstr || newstr.length > 1) {
              return;
            }
          }

          var exists = false;
          vatLines.forEach((_item) => {
            if (_line.text == _item.text) {
              exists = true;
              return true;
            }
          });
          if (!exists) vatLines.push(_line);
        }
      });
    });
    if (vatLines.length > 0) {
      vatLines.forEach((_line) => {
        const _symbols = _line.text.split(" ");
        const lastSymbol = _symbols.pop().replace(",", ".");
        var prices = [];
        let numbers = lastSymbol.match(/[0-9.]+/g);
        numbers &&
          numbers.forEach((_number) => {
            if (parseFloat(_number) < 10000) prices.push(parseFloat(_number));
          });
        if (prices.length > 0) {
          var result = prices.reduce((unique, o) => {
            if (!unique.some((obj) => obj == o)) {
              unique.push(o);
            }
            return unique;
          }, []);
          vatAmount += result.pop();
        }
      });
    }

    // Extract sub total amount
    var subTotalPrice = 0.0;
    lines.forEach((_line) => {
      if (
        _line.text.toLowerCase().includes("sub total") ||
        _line.text.toLowerCase().includes("subtotal")
      ) {
        var prices = [];
        const subjects = _line.text.split(" ");
        subjects.forEach((_subject) => {
          _subject = _subject.replace(",", ".");
          let numbers = _subject.match(/[0-9.]+/g);
          numbers &&
            numbers.forEach((_number) => {
              prices.push(parseFloat(_number));
            });
        });
        if (prices.length > 0) {
          prices.sort((a, b) => b - a);
          subTotalPrice = prices[0];

          return true;
        }
      }
    });

    if (vatAmount == 0 && vatPrice > 0) vatAmount = vatPrice;

    // when total price is empty, subtotal and vat extracted, it will be sum
    if (totalPrice == 0) {
      totalPrice = subTotalPrice + vatAmount;
    }

    const result = {
      issued_at: issuedDate ?? "",
      total_amount: totalPrice,
      vat_amount: vatAmount,
      vat_price: vatPrice,
      currencyCode: currencyCode ? currencyCode : currencySymbolMap.EUR.code,
      currencySymbol: currencySymbol
        ? currencySymbol
        : currencySymbolMap.EUR.symbol_native,
      // parseData: data.lines,
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
    vat_amount,
    comment,
    category_id,
    report_id,
    image,
  } = req.body;

  try {
    const receipt = new Receipt();
    receipt.category = category_id;
    receipt.merchant_info = merchant_info;
    receipt.issued_at = moment(issued_at).format("YYYY-MM-DD");
    receipt.total_amount = total_amount;
    receipt.vat_amount = vat_amount;
    receipt.comment = comment;
    receipt.currency = currency.toUpperCase();
    receipt.country_code = country_code.toUpperCase();
    if (image) receipt.image = image;

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
  const {
    id,
    merchant_info,
    issued_at,
    total_amount,
    currency,
    country_code,
    vat_amount,
    comment,
    image,
  } = req.body;

  try {
    await Receipt.findByIdAndUpdate(
      id,
      {
        $set: {
          merchant_info,
          issued_at: moment(issued_at).format("YYYY-MM-DD"),
          total_amount,
          vat_amount,
          currency,
          country_code,
          comment,
          image: image ?? null,
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
