const express = require("express");

const {
  uploadReceipt,
  createReceipt,
} = require("../../../controllers/user/receiptController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

// Receipts
router.post("/upload", [Authenticated, isUser], uploadReceipt);
router.post("/create", [Authenticated, isUser], createReceipt);

module.exports = router;
