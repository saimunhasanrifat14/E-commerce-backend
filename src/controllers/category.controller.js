const Category = require("../models/category.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateCategory } = require("../validation/category.validation");

exports.createCategory = AsyncHandler(async (req, res) => {
  // validate category data
  const value = await validateCategory(req);

  // save category in database
  const category = await new Category(value).save();

  // check category is created or not
  if (!category) {
    throw new CustomError(500, "Category creation failed try again!");
  }

  // send response
  APIResponse(res, 201, category, "Category created successfully!");
});