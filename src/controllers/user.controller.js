const User = require("../models/user.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateUser } = require("../validation/user.validation");

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
  // send response to client
  return APIResponse.success(res, 200, "User created successfully", user);
});

exports.login = AsyncHandler(async (req, res) => {
  const value = await validateUser(req);
  const { email, password } = value;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError(400, "User not found");
  }
  return APIResponse.success(res, 200, "User logged in successfully", user);
});
