const Joi = require("joi");
const { customError } = require("../utilities/CustomError");

// Define Variant Validation Schema
const variantValidationSchema = Joi.object({
  variantName: Joi.string().trim().required().messages({
    "string.base": "Variant name must be a string.",
    "string.empty": "Variant name is required.",
    "any.required": "Variant name is required.",
  }),
  size: Joi.string()
    .valid("S", "M", "L", "XL", "XXL", "XXXL", "Custom", "N/A")
    .required()
    .messages({
      "string.base": "Size must be a string.",
      "any.required": "Size is required.",
      "string.empty": "Size cannot be empty.",
      "any.only":
        "Size must be one of the following: S, M, L, XL, XXL, XXXL, Custom, N/A.",
    }),
  color: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .required()
    .messages({
      "array.base": "Color must be an array of strings.",
      "array.min": "At least one color is required.",
      "any.required": "Color is required.",
    }),
  stockVariant: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock Variant must be a number.",
    "number.min": "Stock Variant must be at least 0.",
    "any.required": "Stock Variant is required.",
  }),
  alertVariantStock: Joi.number().integer().min(0).required().messages({
    "number.base": "Alert Variant Stock must be a number.",
    "number.min": "Alert Variant Stock must be at least 0.",
    "any.required": "Alert Variant Stock is required.",
  }),
  retailPrice: Joi.number().min(0).required().messages({
    "number.base": "Retail Price must be a number.",
    "number.min": "Retail Price must be at least 0.",
    "any.required": "Retail Price is required.",
  }),
  wholeSalePrice: Joi.number().min(0).required().messages({
    "number.base": "Wholesale Price must be a number.",
    "number.min": "Wholesale Price must be at least 0.",
    "any.required": "Wholesale Price is required.",
  }),
  isActive: Joi.boolean().optional(),
  image: Joi.array().items(Joi.string().uri()).optional(), // for URLs of images
}).options({
  abortEarly: true,
  allowUnknown: true,
});

// Async function to validate variant
exports.validateVariant = async (req) => {
  try {
    // Step 1: Joi validation for fields (basic field validation)
    const value = await variantValidationSchema.validateAsync(req.body);

    // Step 2: Additional validation for images (if provided as files)
    if (req?.files?.image && req.files.image.length > 0) {
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
            `Invalid file type: ${file.originalname}. Only JPG, JPEG, PNG, and WEBP are allowed.`
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new customError(
            400,
            `Image ${file.originalname} exceeds 5MB size limit.`
          );
        }
      });

      value.image = req.files.image;
    }

    return value;
  } catch (error) {
    if (error.details) {
      console.log("Error from validateVariant:", error);
      throw new customError(
        400,
        `Variant Validation Failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateVariant:", error);
      throw new customError(400, `Variant Validation Failed: ${error.message}`);
    }
  }
};