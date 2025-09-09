const Joi = require("joi");
const { CustomError } = require("../utilities/CustomError");

const brandValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Brand name must be a string.",
    "string.empty": "Brand name is required.",
    "any.required": "Brand name is required.",
    "string.trim": "Brand name should not contain extra spaces.",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateBrand = async (req) => {
  try {
    const value = await brandValidationSchema.validateAsync(req.body);

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    // Check if image exists
    if (!req.files?.image || req.files?.image?.length === 0) {
      throw new CustomError(401, "Brand image is required.");
    }

    // Validate file type
    if (!allowedMimeTypes.includes(req?.files?.image[0]?.mimetype)) {
      throw new CustomError(
        "Only JPG, JPEG, PNG, and WEBP image files are allowed."
      );
    }

    // Validate file size (max 5MB)
    if (req?.files?.image[0]?.size >= 5 * 1024 * 1024) {
      throw new CustomError(401, "Image size must be below 5MB.");
    }

    return { name: value.name, image: req?.files?.image[0] };
  } catch (error) {
    if (error.details) {
      console.log("Error from validateBrand:", error.details[0].message);
      throw new CustomError(
        400,
        `Brand Validation Failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateBrand:", error);
      throw new CustomError(400, `Brand Validation Failed: ${error.message}`);
    }
  }
};
