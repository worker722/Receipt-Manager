const express = require("express");

const {
  getCategories,
  getExpenses,
  getAllReports,
  createReport,
  getReport,
} = require("../../../controllers/user/reportController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

// Expenses
router.get("/getExpenses", [Authenticated, isUser], getExpenses);

// Categories
router.get("/getCategories", [Authenticated, isUser], getCategories);

// Reports
router.get("/getAllReports", [Authenticated, isUser], getAllReports);
router.post("/createReport", [Authenticated, isUser], createReport);
router.post("/getReport", [Authenticated, isUser], getReport);

module.exports = router;
