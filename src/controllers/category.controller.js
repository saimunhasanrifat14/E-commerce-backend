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

// get all categories
exports.getAllCategories = AsyncHandler(async (req, res) => {
  const categories = await Category.find();
  if (!categories) {
    throw new CustomError(404, "Categories not found");
  }
  APIResponse(res, 200, categories, "Categories fetched successfully!");
});

// get single category by slug
exports.getSingleCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  APIResponse(res, 200, category, "Category fetched successfully!");
});

// update category
exports.updateCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.slug);
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  category.name = req.body.name;
  category.image = req.file.path;
  await category.save();
  APIResponse(res, 200, category, "Category updated successfully!");
});

// delete category
exports.deleteCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.slug);
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  APIResponse(res, 200, category, "Category deleted successfully!");
});
