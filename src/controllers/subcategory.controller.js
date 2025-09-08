const SubCategory = require("../models/subcategory.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateSubCategory } = require("../validation/subcategroy.validation");

// create subcatagory
exports.createSubCategory = AsyncHandler(async (req, res) => {
  const value = await validateSubCategory(req);
  const { name, category } = value;
  // chack subcategory is exist or not
  const isSubCategoryExist = await SubCategory.findOne({ name });
  if (isSubCategoryExist) {
    throw new CustomError(404, "SubCategory already exist");
  }
  // save subcategory in database
  const subCategory = await new SubCategory({ name, category }).save();
  if (!subCategory) {
    throw new CustomError(500, "SubCategory creation failed try again!");
  }
  APIResponse(res, 201, subCategory, "SubCategory created successfully!");
});

// get all subcategories
exports.getAllSubCategories = AsyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find();
  if (!subCategories) {
    throw new CustomError(404, "SubCategories not found");
  }
  APIResponse(res, 200, subCategories, "SubCategories fetched successfully!");
});

// get single subcategory by slug
exports.getSingleSubCategory = AsyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findOne({ slug: req.params.slug });
  if (!subCategory) {
    throw new CustomError(404, "SubCategory not found");
  }
  APIResponse(res, 200, subCategory, "SubCategory fetched successfully!");
});
