const { REF_NAME: ReceiptRef, Receipt } = require("../../models/receiptModel");
const {
  Report,
  REF_NAME: ReportRef,
  STATUS: REPORT_STATUS,
} = require("../../models/reportModel");
const { Expense } = require("../../models/expenseModel");
const { response } = require("../../utils");
const moment = require("moment");
const jsPDF = require("jspdf").default;
const autoTable = require("jspdf-autotable").default;
const path = require("node:path");
const fs = require("node:fs");
const admzip = require("adm-zip");
const _ = require("lodash");

const LOG_PATH = "user/reportController";

const getAllReports = async (req, res) => {
  try {
    Report.find({
      status: { $nin: [REPORT_STATUS.IN_PROGRESS] },
    })
      .sort({ status: 1 })
      .populate(ReportRef.EXPENSE_IDS)
      .populate(ReportRef.RECEIPT_IDS)
      .populate(ReportRef.REPORTER)
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
      .populate(ReportRef.REPORTER)
      .then((report) => {
        var promisses = [];
        var receipts = [];
        report.receipt_ids.forEach((_receipt) => {
          const promiss = new Promise((resolve, reject) => {
            _receipt.populate(ReceiptRef.CATEGORY).then((_newReceipt) => {
              receipts.push(_newReceipt);
              resolve();
            });
          });
          promisses.push(promiss);
        });
        Promise.all(promisses).then(() => {
          report.receipt_ids = receipts;
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

const exportReport = async (req, res) => {
  const { publicId } = req.body;

  try {
    Report.findOne({ public_id: publicId }).then((report) => {
      if (report.zip_file) {
        if (fs.existsSync(report.zip_file)) {
          res.download(report.zip_file, (err) => {
            if (err) console.log(err);
          });
          return;
        }
      }
      Receipt.find({ _id: { $in: report.receipt_ids } })
        .populate(ReceiptRef.CATEGORY)
        .then((receipts) => {
          generatePDF(req, res, receipts);
        });
    });
  } catch (error) {
    console.log(`${LOG_PATH}@exportReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const generatePDF = (req, res, receipts) => {
  const { publicId, totalWithoutReceipt, totalPersonal, totalVat } = req.body;

  const doc = new jsPDF();
  const receiptTableHeaders = [
    "ID",
    "Type",
    "Date",
    "Raison sociale commerçant",
    "Amount EUR",
    "Amount Currency",
    "VAT 1",
    "VAT 2",
    "VAT 3",
    "Country",
    "Comment",
  ];

  const categoryTableHeaders = ["Name", "NB", "HT", "VAT"];

  var receipt_images = [];
  var receiptTableData = receipts.map((row, index) => {
    receipt_images.push(row.image);
    return [
      `#${index + 1}`,
      row.category.name,
      toLocalTime(row.issued_at),
      row.merchant_info,
      row.amount_eur + " €",
      row.total_amount + " " + row.currency,
      row.vat_amount_1,
      row.vat_amount_2,
      row.vat_amount_3,
      row.country_code,
      row.comment,
    ];
  });

  receiptTableData.push(
    ["", "", "", "", "", "", ""],
    ["", "Total Without Receipt", totalWithoutReceipt + " €", "", "", "", ""],
    ["", "Total Personal", totalPersonal + " €", "", "", "", ""],
    ["", "Total VAT", totalVat + " €", "", "", "", ""]
  );

  doc.text(`Report_#${publicId}`, 14, 10);

  autoTable(doc, {
    head: [receiptTableHeaders],
    body: receiptTableData,
    styles: {
      fontSize: 8,
      halign: "left",
    },
  });

  const groupReceiptByCategory = _.groupBy(receipts, "category._id");

  var categoryTableData = Object.keys(groupReceiptByCategory).map((key) => {
    const _receipt = groupReceiptByCategory[key];
    const _totalAmount = _.sumBy(_receipt, function (o) {
      return parseFloat(o.amount_eur);
    });
    const _totalVAT = _.sumBy(_receipt, function (o) {
      return (
        parseFloat(o.vat_amount_1) +
        parseFloat(o.vat_amount_2) +
        parseFloat(o.vat_amount_3)
      );
    });
    return [
      _receipt[0].category.name,
      _receipt.length,
      adjustFloatValue(_totalAmount) + " €",
      adjustFloatValue(_totalVAT) + " €",
    ];
  });

  doc.text("Summary by Category", 15, doc.autoTable.previous.finalY + 15);

  autoTable(doc, {
    head: [categoryTableHeaders],
    body: categoryTableData,
    styles: {
      fontSize: 8,
      halign: "left",
    },
    startY: doc.autoTable.previous.finalY + 20,
  });

  var reportPDF_path = `./uploads/report/${publicId}/Report_#${publicId}.pdf`;
  doc.save(reportPDF_path);

  /****** Archive Zip File (Report PDF && Receipt Images) ******/
  archiveReportZip(res, publicId, reportPDF_path, receipts);
};

const archiveReportZip = (res, publicId, pdf, receipts) => {
  var zip = new admzip();
  var outputFilePath = `./uploads/report/${publicId}/Report_#${publicId}.zip`;
  zip.addLocalFile(pdf);
  receipts.forEach((_receipt) => {
    if (_receipt.image) {
      zip.addLocalFile(_receipt.image);
    }
  });

  fs.writeFileSync(outputFilePath, zip.toBuffer());

  Report.findOneAndUpdate(
    { public_id: publicId },
    {
      $set: {
        zip_file: outputFilePath,
      },
    },
    {
      $new: true,
    }
  ).then((updateReport) => {
    res.download(outputFilePath, (err) => {
      if (err) console.log(err);
    });
  });
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
      .populate(ReportRef.RECEIPT_IDS)
      .then((updatedReport) => {
        const BASE_DIR_PATH = path.join(
          path.resolve("./"),
          `uploads/report/${public_id}`
        );

        if (!fs.existsSync(BASE_DIR_PATH)) {
          fs.mkdir(BASE_DIR_PATH, { recursive: true }, (error) => {
            if (error) {
              console.log(`${LOG_PATH}@approveReport`, error);
              return response(res, {}, error, 500, "Something went wrong!");
            }
            processReceiptFiles(res, updatedReport);
          });
        } else {
          processReceiptFiles(res, updatedReport);
        }
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

const processReceiptFiles = (res, updatedReport) => {
  const promises = [];
  updatedReport.receipt_ids.forEach((_receipt, index) => {
    promises.push(
      renameFile(
        _receipt,
        `uploads/report/${updatedReport.public_id}/Receipt_${index + 1}.png`
      )
    );
  });
  Promise.all(promises).then(() => {
    return response(res, { report: updatedReport }, {}, 200);
  });
};

const renameFile = (receipt, dst) => {
  return new Promise((resolve, reject) => {
    fs.rename(receipt.image, dst, (err) => {
      if (!err) {
        Receipt.findByIdAndUpdate(receipt._id, {
          $set: {
            image: dst,
          },
        }).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

const closeReport = (req, res) => {
  const { public_id } = req.body;

  try {
    Report.findOneAndUpdate(
      { public_id },
      {
        $set: {
          status: REPORT_STATUS.CLOSED,
        },
      },
      {
        $new: true,
      }
    )
      .then((closedReport) => {
        return response(res, { report: closedReport }, {}, 200);
      })
      .catch((error) => {
        console.log(`${LOG_PATH}@approveReport`, error);
        response(res, {}, error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@closeReport`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const toLocalTime = (time, format = "YYYY-MM-DD") => {
  return moment(time).format(format);
};

const adjustFloatValue = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

module.exports = {
  getReport,
  getAllReports,
  approveReport,
  closeReport,
  exportReport,
};
