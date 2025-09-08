const Joi = require("joi");
const { CustomError } = require("../utilities/CustomError");

// SubCategory Validation Schema
const subCategoryValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "SubCategory name must be a string.",
    "string.empty": "SubCategory name is required.",
    "any.required": "SubCategory name is required.",
    "string.trim": "SubCategory name should not contain extra spaces.",
  }),
  category: Joi.string().required().messages({
    "any.required": "Category ID is required.",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true, // in case other optional fields are added
});

// Async function to validate SubCategory
exports.validateSubCategory = async (req) => {
  try {
    const value = await subCategoryValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from validateSubCategory:", error.details[0].message);
    throw new CustomError(
      400,
      `SubCategory Validation Failed: ${error.details[0].message}`
    );
  }
};
