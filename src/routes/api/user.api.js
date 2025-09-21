const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyUser,
  resendOtp,
  forgotPassword,
  resetPassword,
  getUser,
  verifyOtp,
} = require("../../controllers/user.controller");

router.route("/registation").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/get-user").get(getUser);
router.route("/verify-user").post(verifyUser);
router.route("/resend-otp").post(resendOtp);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

module.exports = router;
