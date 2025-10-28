const Joi = require("joi");
const { CustomError } = require("../utilities/CustomError");

// Define Review Validation Schema
const reviewValidationSchema = Joi.object({
  rating: Joi.number().min(0).max(5).required().messages({
    "number.base": "Rating must be a number.",
    "number.min": "Rating must be at least 0.",
    "number.max": "Rating cannot be more than 5.",
    "any.required": "Rating is required.",
  }),
  reviewer: Joi.string().optional().messages({
    "string.base": "Reviewer must be a valid user ID.",
  }),
  comment: Joi.string().trim().allow("").messages({
    "string.base": "Comment must be a string.",
    "string.trim": "Comment should not contain extra spaces.",
  }),
  isActive: Joi.boolean().default(true),
  product: Joi.string().required().messages({
    "string.base": "Product ID must be a string.",
    "any.required": "Product ID is required.",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true, // Allows fields like image
});

// Async function to validate review
exports.validateReview = async (req) => {
  try {
    const value = await reviewValidationSchema.validateAsync(req.body);

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    // Check images (if provided)
    if (req.files?.image?.length > 0) {
      for (let file of req.files.image) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new CustomError(
            "Only JPG, JPEG, PNG, and WEBP image files are allowed."
          );
        }
        if (file.size >= 5 * 1024 * 1024) {
          throw new CustomError(401, "Each image size must be below 5MB");
        }
      }
    }

    return { ...value, image: req?.files?.image || [] };
  } catch (error) {
    if (error.details) {
      console.log("Error from validateReview:", error.details[0].message);
      throw new CustomError(
        400,
        `Review Validation Failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateReview:", error);
      throw new CustomError(400, `Review Validation Failed: ${error.message}`);
    }
  }
};