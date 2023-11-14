const express = require("express");

const {
  getAll,
  createCategory,
  updateCategory,
  deleteCategory,
  generateFakeData,
} = require("../../../controllers/admin/manage/categoryController");

const router = express.Router();

const { Authenticated, isAdmin } = require("../../../middleware/authorized");

router.get("/getAll", [Authenticated, isAdmin], getAll);
router.post("/create", [Authenticated, isAdmin], createCategory);
router.post("/update", [Authenticated, isAdmin], updateCategory);
router.post("/delete", [Authenticated, isAdmin], deleteCategory);

// Fake data
// router.post("/fake/generate", generateFakeData);

module.exports = router;
