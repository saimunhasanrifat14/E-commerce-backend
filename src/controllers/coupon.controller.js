const { apiResponse } = require("../utilities/apiResponse");
const { asynchandeler } = require("../utilities/asynchandeler");
const { CustomError } = require("../utilities/CustomError");
const couponModel = require("../models/coupon.model");
const { validateCoupon } = require("../validation/coupon.validation");

// create coupon
exports.createcoupon = asynchandeler(async (req, res) => {
  const data = await validateCoupon(req);
  const coupon = await couponModel.create(data);
  if (!coupon) throw new CustomError(500, "Coupon crate failed!!");
  apiResponse.sendSucess(res, 200, "Coupon created Sucessfully", coupon);
});

// get all coupon
exports.getAllCoupon = asynchandeler(async (req, res) => {
  //   upload image into cloudinary
  const coupon = await couponModel.find();
  if (!coupon) throw new CustomError(500, "Coupon crate failed!!");
  apiResponse.sendSucess(res, 200, "Coupon get Sucessfully", coupon);
});

// get single coupon
exports.getSingleCoupon = asynchandeler(async (req, res) => {
  const { code } = req.params;
  if (!code) throw new CustomError(500, "slug not found !!");
  //   upload image into cloudinary
  const coupon = await couponModel.findOne({ code });
  if (!coupon) throw new CustomError(500, "Coupon crate failed!!");
  apiResponse.sendSucess(res, 200, "Coupon get Sucessfully", coupon);
});