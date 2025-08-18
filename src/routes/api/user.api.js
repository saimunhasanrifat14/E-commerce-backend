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
} = require("../../controllers/user.controller");
const { authGuard } = require("../../middleware/auth.guard.middleware");

router.route("/registation").post(register);
router.route("/login").post(login);
router.route("/logout").post(authGuard, logout);
router.route("/get-user").get(authGuard, getUser);
router.route("/verify-user").post(verifyUser);
router.route("/resend-otp").post(resendOtp);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;
