const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { CustomError } = require("../utilities/CustomError");
const jwt = require("jsonwebtoken");

const { Schema, Types } = mongoose;
const userSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  image: {
    type: String,
    trim: true,
  },
  adress: {
    type: String,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: Types.ObjectId,
    ref: "Role",
  },
  permission: {
    type: Types.ObjectId,
    ref: "Permission",
  },
  region: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  thana: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: Number,
  },
  country: {
    type: String,
    trim: true,
    default: "Bangladesh",
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "custom"],
  },
  lastLogin: {
    type: Date,
  },
  lastLogout: {
    type: Date,
  },
  cart: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  wishList: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  newsLetterSubscribe: Boolean,
  Otp: Number,
  OtpExpireTime: Date,
  twoFactorEnabled: Boolean,
  isBlocked: Boolean,
  refreshToken: {
    type: String,
    trim: true,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpire: {
    type: Date,
    default: null,
  },
  isActive: Boolean,
});

// convert password to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltPassword = await bcrypt.hash(this.password, 10);
    this.password = saltPassword;
  }
  next();
});

// check user is already exist or not
userSchema.pre("save", async function (next) {
  const findUser = await this.constructor.findOne({ email: this.email });
  if (findUser && findUser._id.toString() !== this._id.toString()) {
    throw new CustomError(400, "User already Exist try anther email!");
  }
  next();
});

// compare new password with old password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// create a access token
userSchema.methods.createAccessToken = async function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
    }
  );
};

// create a refresh token
userSchema.methods.createRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
  });
};

// verify access token
userSchema.methods.verifyAccessToken = async function (token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

// verify refresh token
userSchema.methods.verifyRefreshToken = async function (token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = mongoose.model("User", userSchema);
