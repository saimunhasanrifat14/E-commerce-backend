const Joi = require("joi");
const { customError } = require("../utils/customError");

// Define Discount Validation Schema
const discountValidationSchema = Joi.object({
  discountValidFrom: Joi.date().required().messages({
    "date.base": "Discount start date must be a valid date.",
    "any.required": "Discount start date is required.",
  }),
  discountValidTo: Joi.date().required().messages({
    "date.base": "Discount end date must be a valid date.",
    "any.required": "Discount end date is required.",
  }),
  discountName: Joi.string().trim().required().messages({
    "string.base": "Discount name must be a string.",
    "string.empty": "Discount name is required.",
    "any.required": "Discount name is required.",
  }),
  discountType: Joi.string().valid("tk", "percentance").required().messages({
    "any.only": "Discount type must be either 'tk' or 'percentance'.",
    "any.required": "Discount type is required.",
  }),
  discountValueByAmount: Joi.number().min(0).messages({
    "number.base": "Discount amount must be a number.",
    "number.min": "Discount amount cannot be negative.",
  }),
  discountValueByPercentance: Joi.number().min(0).max(100).messages({
    "number.base": "Discount percentage must be a number.",
    "number.min": "Discount percentage cannot be negative.",
    "number.max": "Discount percentage cannot exceed 100.",
  }),
  discountPlan: Joi.string()
    .valid("category", "subCategory", "product", "flat")
    .required()
    .messages({
      "any.only":
        "Discount plan must be 'category', 'subCategory', 'product' or 'flat'.",
      "any.required": "Discount plan is required.",
    }),
  category: Joi.string().optional(), // will be ObjectId in DB
  subCategory: Joi.string().optional(),
  product: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
}).options({
  abortEarly: true,
  allowUnknown: true, // allows extra fields (like slug, timestamps, etc.)
});

// Async function to validate Discount
exports.validateDiscount = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);

    // Check valid date range
    if (new Date(value.discountValidFrom) > new Date(value.discountValidTo)) {
      throw new customError(
        400,
        "Discount start date cannot be after end date."
      );
    }

    // Extra rule: at least one value must be > 0
    if (
      (!value.discountValueByAmount || value.discountValueByAmount <= 0) &&
      (!value.discountValueByPercentance ||
        value.discountValueByPercentance <= 0)
    ) {
      throw new customError(
        400,
        "You must provide either a valid discount amount or a discount percentage."
      );
    }

    return value;
  } catch (error) {
    if (error.details) {
      console.log("Error from validateDiscount:", error.details[0].message);
      throw new customError(
        400,
        `Discount Validation Failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateDiscount:", error);
      throw new customError(
        400,
        `Discount Validation Failed: ${error.message}`
      );
    }
  }
};
