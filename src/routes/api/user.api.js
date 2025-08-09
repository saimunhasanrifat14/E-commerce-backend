const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require("../../controllers/user.controller");

router.route("/registation").post(register);
router.route("/login").post(login);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-otp").post(resendOtp);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;
