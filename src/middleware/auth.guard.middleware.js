const User = require("../models/user.model");
const { CustomError } = require("../utilities/CustomError");
const jwt = require("jsonwebtoken");

exports.authGuard = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new CustomError(401, "Unauthorized");
  } else {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
      throw new CustomError(401, "Unauthorized");
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new CustomError(401, "Unauthorized");
    }
    req.user = user;
    next();
  }
};
