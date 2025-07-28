const asyncHandler = require("../utilities/asyncHandler");

exports.testController = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "This is a test controller",
  });
});
