const express = require("express");

const {
  getAll,
  createUser,
  updateUser,
  deleteUser,
} = require("../../../controllers/admin/manage/usersController");

const router = express.Router();

const Authenticated = require("../../../middleware/authorized");

router.get("/getAll", [Authenticated], getAll);
router.post("/create", createUser);
router.post("/update", updateUser);
router.post("/delete", deleteUser);

module.exports = router;
