const express = require("express");

const {
  uploadReceipt,
  getCategories,
  getExpenses,
  createReport,
  getReport,
  getAllReports,
} = require("../../../controllers/user/reportController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

// Receipts
router.post("/upload", [Authenticated, isUser], uploadReceipt);

// Expenses
router.get("/getExpenses", [Authenticated, isUser], getExpenses);

// Receipt Categories
router.get("/getCategories", [Authenticated, isUser], getCategories);

// Reports
router.get("/getAllReports", [Authenticated, isUser], getAllReports);
router.post("/createReport", [Authenticated, isUser], createReport);
router.post("/getReport", [Authenticated, isUser], getReport);

module.exports = router;
