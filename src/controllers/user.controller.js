const User = require("../models/user.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateUser } = require("../validation/user.validation");
const sendEmail = require("../helpers/email.helper");

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
  // send email to user
  await sendEmail(user.email, "Verify your email");
  
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
