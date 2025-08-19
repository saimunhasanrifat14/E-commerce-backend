const joi = require("joi");
const { CustomError } = require("../utilities/CustomError");

// Define Category Validation Schema
const categoryValidationSchema = joi
  .object({
    name: joi.string().trim().required().messages({
      "string.base": "Category name must be a string.",
      "string.empty": "Category name is required.",
      "any.required": "Category name is required.",
      "string.trim": "Category name should not contain extra spaces.",
    }),
  })
  .options({
    abortEarly: true,
    allowUnknown: true,
  });

exports.validateCategory = async (req) => {
  try {
    const value = await categoryValidationSchema.validateAsync(req.body);

    // check files are selected or not
    if (req.files?.image?.length == 0) {
      throw new CustomError(401, "Image is required");
    }
    // Check MIME type
    if (req?.files?.image) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(req?.files?.image?.mimetype)) {
        throw new CustomError(
          401,
          "Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed."
        );
      }
    }
    // check image size if file size > 5MB
    if (req?.files?.image) {
      const fileSize = req?.files?.image?.size;
      if (fileSize > 5 * 1024 * 1024) {
        throw new CustomError(401, "Image size should be less than 5MB.");
      }
    }
    return value;
  } catch (error) {
    // joi error
    if (error.details) {
      throw new CustomError(
        401,
        `Category Validation Failed: ${error.details[0].message}`
      );
    } else {
      // other error
      throw new CustomError(
        401,
        `Category Validation Failed: ${error.message}`
      );
    }
  }
};
