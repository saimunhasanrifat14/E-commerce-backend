const User = require("../models/user.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateUser } = require("../validation/user.validation");
const sendEmail = require("../helpers/email.helper");
const crypto = require("crypto");
const {
  registerEmailTemplate,
  forgotPasswordEmailTemplate,
} = require("../template/Email.tamplate");

exports.register = AsyncHandler(async (req, res) => {
  // validate user data
  const value = await validateUser(req);

  // save user in database
  const { firstName, email, password } = value;
  const user = await new User({ firstName, email, password }).save();

  // check user is created or not
  if (!user) {
    throw new CustomError(500, "Registration failed try again!");
  }

  // rendom 6 digit Otp
  const Otp = crypto.randomInt(100000, 999999);
  const expireTime = Date.now() + 5 * 60 * 1000;

  // save Otp in user
  user.Otp = Otp;
  user.OtpExpireTime = expireTime;
  await user.save();

  // create template
  const template = registerEmailTemplate(Otp, expireTime);

  // send email to user
  await sendEmail(user.email, "Verify your email", template);

  // send response to client
  return APIResponse.success(res, 200, "User created successfully", user);
});

// login
exports.login = AsyncHandler(async (req, res) => {
  const value = await validateUser(req);
  const { email, phoneNumber, password } = value;
  const user = await User.findOne({
    $or: [{ email: email }, { phoneNumber: phoneNumber }],
  });

  // Check if user exists
  if (!user) {
    throw new CustomError(
      400,
      "User not found with this email or phone number"
    );
  }

  const passwordIsCorrect = await user.comparePassword(password);
  if (!passwordIsCorrect) {
    throw new CustomError(400, "Your Password or Email incorrect");
  }
  // make a access and refreshToken
  const accessToken = await user.createAccessToken();
  const refreshToken = await user.createRefreshToken();

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction ? true : false, // http / https
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 7 days
  });

  return APIResponse.success(res, 200, "Login Successfull", {
    accessToken: accessToken,
    refreshToken: refreshToken,
    email: user.email,
  });
});

// logout
exports.logout = AsyncHandler(async (req, res) => {
  res.clearCookie("refreshToken");
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save();
  return APIResponse.success(res, 200, "Logout successfully");
});

// verify email
exports.verifyEmail = AsyncHandler(async (req, res) => {
  const { Otp } = req.body;
  // check Otp is provided or not
  if (!Otp) {
    throw new CustomError(400, "Otp is required");
  }
  // check user is already verified or not
  const user = await User.findOne({
    $and: [{ Otp: Otp }, { OtpExpireTime: { $gt: Date.now() } }],
  });
  if (!user) {
    throw new CustomError(400, "Invalid verification Otp");
  }
  // update user
  user.isEmailVerified = true;
  user.Otp = null;
  user.OtpExpireTime = null;
  await user.save();

  // send response to client
  return APIResponse.success(res, 200, "Email verified successfully", user);
});

// resend Otp
exports.resendOtp = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  // check user is already exist or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(400, "User not found");
  }
  // rendom 6 digit Otp
  const Otp = crypto.randomInt(100000, 999999);
  const expireTime = Date.now() + 5 * 60 * 1000;

  // save Otp in user
  user.Otp = Otp;
  user.OtpExpireTime = expireTime;
  await user.save();

  // create template
  const template = registerEmailTemplate(Otp, expireTime);

  // send email to user
  await sendEmail(user.email, "Verify your email", template);

  // send response to client
  return APIResponse.success(res, 200, "Otp sent successfully", user);
});

// forgot password
exports.forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  // check user is already exist or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(400, "User not found");
  }
  // unique reset token
  const resetToken = crypto
    .createHash("sha256")
    .update(crypto.randomInt(100000, 999999))
    .digest("hex");
  const expireTime = Date.now() + 5 * 60 * 1000;

  // save Otp in user
  user.resetToken = resetToken;
  user.resetTokenExpire = expireTime;
  await user.save();

  // reset url
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  // create template
  const template = forgotPasswordEmailTemplate(expireTime, resetUrl);

  // send email to user
  await sendEmail(user.email, "Verify your email", template);

  // send response to client
  return APIResponse.success(res, 200, "Otp sent successfully", {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
});

// reset password
exports.resetPassword = AsyncHandler(async (req, res) => {
  const { resetToken, password, confirmPassword } = req.body;
  // check resetToken and password and confirmPassword is provided or not
  if (!resetToken || !password || !confirmPassword) {
    throw new CustomError(400, "All fields are required");
  }
  // check password and confirmPassword is match or not
  if (password !== confirmPassword) {
    throw new CustomError(400, "Password not match");
  }

  // check user is already exist or not
  const user = await User.findOne({
    $and: [
      { resetToken: resetToken },
      { resetTokenExpire: { $gt: Date.now() } },
    ],
  });
  if (!user) {
    throw new CustomError(400, "Your reset link is invalid or expired");
  }

  // update user
  user.password = password;
  user.resetToken = null;
  user.resetTokenExpire = null;
  await user.save();

  // send response to client
  return APIResponse.success(res, 200, "Password reset successfully", {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
});

// access token generate after access token expire with refresh token
exports.generateAccessToken = AsyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  // check refresh token is provided or not
  if (!refreshToken) {
    throw new CustomError(400, "Refresh token is required");
  }
  // verify refresh token
  const decoded = await User.verifyRefreshToken(refreshToken);
  // check user is already exist or not
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new CustomError(400, "User not found");
  }
  // generate access token
  const accessToken = await user.createAccessToken();
  // send response to client
  return APIResponse.success(res, 200, "Access token generated successfully", {
    firstName: user.firstName,
    lastName: user.lastName,
    accessToken: accessToken,
    refreshToken: refreshToken,
    email: user.email,
  });
});
