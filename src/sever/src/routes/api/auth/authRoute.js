const express = require("express");

const {
  SignUp,
  SignInWithEmailAndPassword,
  SignInWithToken,
  SignOut,
} = require("@controllers/auth/authController");

const router = express.Router();

router.post("/register", SignUp);
router.post("/login", SignInWithEmailAndPassword);
router.post("/access-token", SignInWithToken);
router.get("/logout", SignOut);

module.exports = router;
