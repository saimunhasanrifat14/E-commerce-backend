const Joi = require("joi");
const { CustomError } = require("../utilities/CustomError");

const userSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required",
    "string.empty": "First name cannot be empty",
    "name.trim": "Name fill with extra space",
  }),
  email: Joi.string()
    .trim()
    .required()
    .pattern(/^\S+@\S+\.\S+$/)
    .messages({
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
      "string.pattern": "Email is not valid",
    }),
  password: Joi.string()
    .trim()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
      "string.pattern":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateUser = async (req) => {
  try {
    console.log("User validation started");
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      throw new CustomError(400, error.details[0].message);
    }
    return value;
  } catch (error) {
    console.log("Error from validateUser", error);
    throw new CustomError(400, `User validation failed ${error.message}`);
  }
};
