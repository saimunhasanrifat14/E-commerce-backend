const Joi = require("joi");
const { customError } = require("../utils/customError");

// Define Product Validation Schema
const productValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Product name must be a string.",
    "string.empty": "Product name is required.",
    "any.required": "Product name is required.",
  }),
  description: Joi.string().allow("").optional(),
  wholeSalePrice: Joi.number().messages({
    "number.base": "Wholesale price must be a number.",
    "any.required": "Wholesale price is required.",
  }),
  retailPrice: Joi.number().messages({
    "number.base": "Retail price must be a number.",
    "any.required": "Retail price is required.",
  }),
  category: Joi.string().hex().length(24).required(),
  subCategory: Joi.string().hex().length(24).allow(null),

  brand: Joi.string().hex().length(24).allow(null),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

// Async function to validate product + images
exports.validateProduct = async (req) => {
  try {
    // Step 1: Joi validation for fields
    const value = await productValidationSchema.validateAsync(req.body);

    if (value.productType === "singleVariant") {
      if (!req?.files?.image || req.files.image.length === 0) {
        throw new customError(400, "At least one product image is required.");
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      req.files.image.forEach((file) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new customError(
            400,
            `Invalid file type: ${file.originalname}. Only JPG, JPEG, PNG, WEBP are allowed.`
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new customError(
            400,
            `Image ${file.originalname} exceeds 5MB size limit.`
          );
        }
        return {
          ...value,
          images: req.files.image,
        };
      });
    } else {
      return {
        ...value,
        images: [],
      };
    }
  } catch (error) {
    if (error.details) {
      console.log("Error from validateProduct:", error);
      throw new customError(
        400,
        `Product Validation Failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateProduct:", error);
      throw new customError(400, `Product Validation Failed: ${error.message}`);
    }
  }
};
