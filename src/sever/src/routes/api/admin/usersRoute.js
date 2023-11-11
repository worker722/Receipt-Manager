const express = require("express");

const {
  getAll,
  createUser,
  updateUser,
  updateAvatar,
  deleteUser,
  generateFakeData
} = require("../../../controllers/admin/manage/usersController");

const router = express.Router();

const { Authenticated, isAdmin } = require("../../../middleware/authorized");

router.get("/getAll", [Authenticated, isAdmin], getAll);
router.post("/create", [Authenticated, isAdmin], createUser);
router.post("/update", [Authenticated, isAdmin], updateUser);
router.post("/update/avatar", [Authenticated, isAdmin], updateAvatar);
router.post("/delete", [Authenticated, isAdmin], deleteUser);

// Fake data
// router.post("/fake/generate", generateFakeData);


module.exports = router;
