const User = require("../models/user.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");

exports.register = AsyncHandler(async (req, res) => {
  console.log(req.body);
  return APIResponse.success(res, 200, "User created successfully", req.body);
});

exports.login = AsyncHandler(async (req, res) => {
  console.log(req.body);
  return APIResponse.success(res, 200, "User logged in successfully", req.body);
});
