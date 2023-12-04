const express = require("express");

const {
  uploadReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
} = require("../../../controllers/user/receiptController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

// Receipts
router.post("/upload", [Authenticated, isUser], uploadReceipt);
router.post("/create", [Authenticated, isUser], createReceipt);
router.post("/update", [Authenticated, isUser], updateReceipt);
router.post("/delete", [Authenticated, isUser], deleteReceipt);

module.exports = router;
