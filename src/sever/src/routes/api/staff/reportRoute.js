const express = require("express");

const {
  getAllReports,
  getReport,
  approveReport,
  closeReport,
} = require("../../../controllers/staff/reportController");

const router = express.Router();

const { Authenticated, isStaff } = require("../../../middleware/authorized");

router.get("/getAllReports", [Authenticated, isStaff], getAllReports);
router.post("/getReport", [Authenticated, isStaff], getReport);
router.post("/approveReport", [Authenticated, isStaff], approveReport);
router.post("/closeReport", [Authenticated, isStaff], closeReport);

module.exports = router;
