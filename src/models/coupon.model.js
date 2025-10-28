const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

// Coupon Schema
const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: [true, "Coupon code must be unique"],
      lowercase: [true, "Coupon code must be lowercase"],
      trim: true,
    },
    expireAt: {
      type: Date,
      required: [true, "Coupon expire date is required"],
    },
    usageLimit: {
      type: Number,
      required: [true, "Coupon usage limit is required"],
      max: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "tk"],
      required: [true, "Discount type is required (tk or percentage)"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure slug is unique
couponSchema.pre("save", async function (next) {
  const existingCoupon = await this.constructor.findOne({
    _id: this._id,
  });

  if (existingCoupon && existingCoupon._id.toString() !== this._id.toString()) {
    throw new Error("Coupon with this code already exists, try another code!");
  }

  next();
});

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);