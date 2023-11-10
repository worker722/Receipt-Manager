const express = require("express");

const {
  getAll,
  createRole,
  updateRole,
  deleteRole,
} = require("@controllers/admin/manage/rolesController");

const router = express.Router();

const { Authenticated, isAdmin } = require("@middleware/authorized");

router.get("/getAll", [Authenticated, isAdmin], getAll);
router.post("/create", [Authenticated, isAdmin], createRole);
router.post("/update", [Authenticated, isAdmin], updateRole);
router.post("/delete", [Authenticated, isAdmin], deleteRole);


module.exports = router;
