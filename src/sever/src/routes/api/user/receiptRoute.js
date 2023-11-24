const express = require("express");

const {
  getAll,
  uploadReceipt,
  getCategories,
  getExpenses,
} = require("../../../controllers/user/receiptController");

const router = express.Router();

const { Authenticated, isUser } = require("../../../middleware/authorized");

router.get("/getAll", [Authenticated, isUser], getAll);
router.get("/getExpenses", [Authenticated, isUser], getExpenses);
router.get("/getCategories", [Authenticated, isUser], getCategories);
router.post("/upload", [Authenticated, isUser], uploadReceipt);

module.exports = router;
