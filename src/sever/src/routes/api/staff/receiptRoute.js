const express = require("express");

const {
  updateReceipt,
} = require("../../../controllers/staff/receiptController");

const router = express.Router();

const { Authenticated, isStaff } = require("../../../middleware/authorized");

// Receipts
router.post("/update", [Authenticated, isStaff], updateReceipt);

module.exports = router;
