const express = require("express");

const {
  uploadReceipt,
  createReceipt,
  updateReceipt,
} = require("../../../controllers/user/receiptController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

// Receipts
router.post("/upload", [Authenticated, isUser], uploadReceipt);
router.post("/create", [Authenticated, isUser], createReceipt);
router.post("/update", [Authenticated, isUser], updateReceipt);

module.exports = router;
