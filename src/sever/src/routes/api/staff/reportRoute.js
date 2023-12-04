const express = require("express");

const {
  getCategories,
  getExpenses,
  getAllReports,
  createReport,
  getReport,
  matchReport,
  submitReport,
} = require("../../../controllers/staff/reportController");

const router = express.Router();

const { Authenticated, isStaff } = require("../../../middleware/authorized");

// Expenses
router.get("/getExpenses", [Authenticated, isStaff], getExpenses);

// Categories
router.get("/getCategories", [Authenticated, isStaff], getCategories);

// Reports
router.get("/getAllReports", [Authenticated, isStaff], getAllReports);
router.post("/createReport", [Authenticated, isStaff], createReport);
router.post("/getReport", [Authenticated, isStaff], getReport);
router.post("/matchReport", [Authenticated, isStaff], matchReport);
router.post("/submitReport", [Authenticated, isStaff], submitReport);

module.exports = router;
