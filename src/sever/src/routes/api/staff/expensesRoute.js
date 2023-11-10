const express = require("express");

const {
  getAll,
  createExpense,
} = require("@controllers/staff/expensesController");

const router = express.Router();

const { Authenticated, isStaff } = require("@middleware/authorized");

router.get("/getAll", [Authenticated, isStaff], getAll);
router.post("/create", [Authenticated, isStaff], createExpense);


module.exports = router;
