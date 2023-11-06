const express = require("express");

const {
  forgetPassword,
  resetPassword,
  verifyPasswordResetToken
} = require("../../../controllers/auth/passwordController");

const router = express.Router();

router.post("/forget", forgetPassword);
router.post("/reset", resetPassword);
router.get("/verify", verifyPasswordResetToken);

module.exports = router;
