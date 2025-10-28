const express = require("express");
const router = express.Router();

const couponController = require("../../controllers/coupon.controller");
router.route("/create-coupon").post(couponController.createcoupon);
router.route("/get-all-coupon").get(couponController.getAllCoupon);
router.route("/single-coupon/:code").get(couponController.getSingleCoupon);
module.exports = router;