const express = require("express");

const {
  approveReceipt,
  refundReceipt,
} = require("../../../controllers/staff/receiptController");

const router = express.Router();

const { Authenticated, isStaff } = require("../../../middleware/authorized");

// Receipts
router.post("/approve", [Authenticated, isStaff], approveReceipt);
router.post("/refund", [Authenticated, isStaff], refundReceipt);

module.exports = router;
