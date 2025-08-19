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
const { smsSend } = require("../helpers/sms.helpers");

exports.register = AsyncHandler(async (req, res) => {
  // validate user data
  const value = await validateUser(req);

  // save user in database
  const { firstName, email, phoneNumber, password } = value;

  if (!email && !phoneNumber) {
    throw new CustomError(400, "Email or Phone number is required");
  }
  const user = await new User({
    firstName,
    email: email || null,
    phoneNumber: phoneNumber || null,
    password,
  }).save();

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

  if (email) {
    const template = registerEmailTemplate(Otp, expireTime);
    await sendEmail(user.email, "Verify your email", template);
  }

  if (phoneNumber) {
    const smsbody = `Hi ${user.firstName}, complete your registration using this Otp: ${Otp} This Otp will expire in ${expireTime}.`;
    const smsInfo = await smsSend(phoneNumber, smsbody);
    if (smsInfo.response_code !== 202) {
      console.log("Sms not send", smsInfo);
    }
  }

  // send response to client
  return APIResponse.success(res, 200, "User created successfully", user);
});

// login
exports.login = AsyncHandler(async (req, res) => {
  const value = await validateUser(req);
  const { email, phoneNumber, password } = value;

  if (!email && !phoneNumber) {
    throw new CustomError(400, "Email or Phone number is required");
  }

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

  // CASE 1: User not verified → send OTP
  if (!user.isUserVerified) {
    // rendom 6 digit Otp
    const Otp = crypto.randomInt(100000, 999999);
    const expireTime = Date.now() + 5 * 60 * 1000;

    // save Otp in user
    user.Otp = Otp;
    user.OtpExpireTime = expireTime;
    await user.save();

    if (email) {
      const template = registerEmailTemplate(Otp, expireTime);
      await sendEmail(user.email, "Verify your email", template);
    }
    if (phoneNumber) {
      const smsbody = `Hi ${user.firstName}, complete your registration using this Otp: ${Otp} This Otp will expire in ${expireTime}.`;
      const smsInfo = await smsSend(phoneNumber, smsbody);
      if (smsInfo.response_code !== 202) {
        console.log("Sms not send", smsInfo);
      }
    }
    return APIResponse.success(res, 200, "Otp sent successfully", user);
  }

  // CASE 2: User already verified → normal login
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

// get user
exports.getUser = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError(404, "User not found");
  }
  return APIResponse.success(res, 200, "User fetched successfully", user);
});

// verify email
exports.verifyUser = AsyncHandler(async (req, res) => {
  const { otp, email, phoneNumber } = req.body;

  if (!otp || (!email && !phoneNumber)) {
    throw new CustomError(400, "Otp and email/phone are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  // check otp validity
  if (user.Otp !== otp || user.OtpExpireTime < Date.now()) {
    throw new CustomError(400, "Otp invalid or expired");
  }

  // update verification status
  user.isUserVerified = true;
  user.Otp = null;
  user.OtpExpireTime = null;
  await user.save();

  return APIResponse.success(res, 200, "User verified successfully", {
    email: user.email,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
  });
});

// resend Otp
exports.resendOtp = AsyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;
  // check user is already exist or not
  const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
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

  if (email) {
    const template = registerEmailTemplate(Otp, expireTime);
    await sendEmail(user.email, "Verify your email", template);
  }

  if (phoneNumber) {
    const smsbody = `Hi ${user.firstName}, complete your verification using this Otp: ${Otp} This Otp will expire in ${expireTime}.`;
    const smsInfo = await smsSend(phoneNumber, smsbody);
    if (smsInfo.response_code !== 202) {
      throw new CustomError(500, "Failed to send OTP SMS");
    }
  }

  // send response to client
  return APIResponse.success(res, 200, "Otp sent successfully", user);
});

// forgot password
exports.forgotPassword = AsyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    throw new CustomError(400, "Email or Phone number is required");
  }

  // check user is already exist or not
  const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (!user) {
    throw new CustomError(400, "User not found");
  }

  if (email) {
    // unique reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expireTime = Date.now() + 5 * 60 * 1000;
    user.resetToken = resetToken;
    user.resetTokenExpire = expireTime;
    await user.save();
    // send email
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const template = forgotPasswordEmailTemplate(expireTime, resetUrl);
    await sendEmail(user.email, "Forgot Password", template);
    // send response to client
    return APIResponse.success(res, 200, "Reset link sent successfully", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }
  if (phoneNumber) {
    // unique otp
    const otp = crypto.randomInt(100000, 999999);
    const expireTime = Date.now() + 5 * 60 * 1000;
    user.Otp = otp;
    user.OtpExpireTime = expireTime;
    await user.save();
    // send sms
    const smsbody = `Hi ${user.firstName}, Reset your password using this Otp: ${otp} This Otp will expire in 5 minutes.`;
    const smsInfo = await smsSend(phoneNumber, smsbody);
    if (smsInfo.response_code !== 202) {
      throw new CustomError(500, "Failed to send OTP SMS");
    }
    // send response to client
    return APIResponse.success(res, 200, "Otp sent successfully", {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    });
  }
});

// verify otp
exports.verifyOtp = AsyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const user = await User.findOne({ phoneNumber });

  if (!user || !user.Otp || user.OtpExpireTime < Date.now()) {
    throw new CustomError(400, "OTP invalid or expired");
  }

  if (user.Otp !== parseInt(otp)) {
    throw new CustomError(400, "OTP mismatch");
  }

  // OTP ঠিক আছে → Temporary token issue করো
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 5 * 60 * 1000;
  user.Otp = null;
  user.OtpExpireTime = null;
  await user.save();

  return APIResponse.success(res, 200, "OTP verified", { resetToken });
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
    throw new CustomError(400, "Your reset link is invalid");
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
