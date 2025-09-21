const Category = require("../models/category.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateCategory } = require("../validation/category.validation");
const { uploadImage, deleteImage } = require("../helpers/cloudinary");

exports.createCategory = AsyncHandler(async (req, res) => {
  // validate category data
  const value = await validateCategory(req);
  const { name, image } = value;

  // upload image
  const uploadedImage = await uploadImage(image.path);

  // save category in database
  const category = await new Category({ name, image: uploadedImage }).save();

  // check category is created or not
  if (!category) {
    throw new CustomError(500, "Category creation failed try again!");
  }

  // send response
  APIResponse.success(res, 201, category, "Category created successfully!");
});

// get all categories
exports.getAllCategories = AsyncHandler(async (req, res) => {
  const categories = await Category.find().populate("subCategory");
  // const alllcategory = await categoryModel.aggregate([
  //   {
  //     $lookup: {
  //       from: "subcategories",
  //       localField: "subCategory",
  //       foreignField: "_id",
  //       as: "subCategory",
  //     },
  //   },
  //   {
  //     $project: {
  //       name: 1,
  //       image: 1,
  //       isActive: 1,
  //       createdAt: 1,
  //       slug: 1,
  //       subCategory: 1,
  //     },
  //   },
  //   {
  //     $sort: { createdAt: -1 },
  //   },
  // ]);
  if (!categories) {
    throw new CustomError(404, "Categories not found");
  }
  APIResponse.success(res, 200, categories, "Categories fetched successfully!");
});

// get single category by slug
exports.getSingleCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  APIResponse.success(res, 200, category, "Category fetched successfully!");
});

// update category
exports.updateCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  if (req.body.name) {
    category.name = req.body.name;
  }
  if (req.file) {
    await deleteImage(category.image.public_id);
    const uploadedImage = await uploadImage(req.file.path);
    category.image = uploadedImage;
  }
  await category.save();
  APIResponse.success(res, 200, category, "Category updated successfully!");
});

// delete category
exports.deleteCategory = AsyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ slug: req.params.slug });
  if (!category) {
    throw new CustomError(404, "Category not found");
  }
  await deleteImage(category.image.public_id);
  APIResponse.success(res, 200, category, "Category deleted successfully!");
});
