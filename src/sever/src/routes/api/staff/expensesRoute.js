const express = require("express");

const {
  getUsers,
  getAll,
  createExpense,
} = require("../../../controllers/staff/expensesController");

const router = express.Router();

const { Authenticated, isStaff } = require("../../../middleware/authorized");

router.get("/getUsers", [Authenticated, isStaff], getUsers);
router.post("/getAll", [Authenticated, isStaff], getAll);
router.post("/create", [Authenticated, isStaff], createExpense);

module.exports = router;
