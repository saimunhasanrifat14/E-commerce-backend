const joi = require("joi");

const validateCategory = (req) => {
  const schema = joi.object({
    name: joi.string().required().trim(),
    image: joi.string().required().trim(),
  });
  return schema.validate(req.body);
};

module.exports = validateCategory;
