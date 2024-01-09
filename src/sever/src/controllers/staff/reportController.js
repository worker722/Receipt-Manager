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
  const tableHeaders = [
    "Type",
    "Date",
    "Raison sociale commerçant",
    "Amount",
    "Currency",
    "VAT 1",
    "VAT 2",
    "VAT 3",
    "Country",
    "Comment",
  ];

  var receipt_images = [];
  var tableData = receipts.map((row) => {
    receipt_images.push(row.image);
    return [
      row.category.name,
      toLocalTime(row.issued_at),
      row.merchant_info,
      row.total_amount,
      row.currency,
      row.vat_amount_1,
      row.vat_amount_2,
      row.vat_amount_3,
      row.country_code,
      row.comment,
    ];
  });

  tableData.push(
    ["", "", "", "", "", "", ""],
    ["", "Total Without Receipt", totalWithoutReceipt + " €", "", "", "", ""],
    ["", "Total Personal", totalPersonal + " €", "", "", "", ""],
    ["", "Total VAT", totalVat + " €", "", "", "", ""]
  );

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    styles: {
      fontSize: 8,
      halign: "left",
    },
  });

  doc.text(`Report_#${publicId}`, 14, 10);

  // App_path/uploads/report
  const BASE_DIR_PATH = path.join(path.resolve("./"), "uploads/report/");

  var reportPDF_path = `./uploads/report/Report_#${publicId}_${moment().format(
    "YYYY_MM_DD"
  )}.pdf`;

  if (!fs.existsSync(BASE_DIR_PATH)) {
    fs.mkdir(BASE_DIR_PATH, { recursive: true }, (err) => {
      if (err) {
        reportPDF_path = `./uploads/Report_#${publicId}_${moment().format(
          "YYYY_MM_DD"
        )}.pdf`;
      } else {
        reportPDF_path = `./uploads/reporty/Report_#${publicId}_${moment().format(
          "YYYY_MM_DD"
        )}.pdf`;
      }
      doc.save(reportPDF_path);
    });
  } else {
    doc.save(reportPDF_path);
  }

  /****** Archive Zip File (Report PDF && Receipt Images) ******/
  archiveReportZip(res, publicId, reportPDF_path, receipts);
};

const archiveReportZip = (res, publicId, pdf, receipts) => {
  var zip = new admzip();
  var outputFilePath =
    "./uploads/report/Report_#" +
    publicId +
    "_" +
    moment().format("YYYY_MM_DD") +
    ".zip";
  zip.addLocalFile(pdf);
  receipts.forEach((_receipt) => {
    if (_receipt.image) {
      zip.addLocalFile(_receipt.image);
    }
  });

  fs.writeFileSync(outputFilePath, zip.toBuffer());
  res.download(outputFilePath, (err) => {
    if (err) console.log(err);
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

module.exports = {
  getReport,
  getAllReports,
  approveReport,
  closeReport,
  exportReport,
};
