const SubCategory = require("../models/subcategory.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateSubCategory } = require("../validation/subcategroy.validation");
const CategoryModel = require("../models/category.model");

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

  //  update category subcategory field
  const updateCategory = await CategoryModel.findOneAndUpdate(
    { _id: value.category },
    { $push: { subCategory: subCategory._id } },
    { new: true }
  );

  APIResponse.success(
    res,
    201,
    "SubCategory created successfully!",
    subCategory
  );
});

// get all subcategories
exports.getAllSubCategories = AsyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find({});
  if (!subCategories) {
    throw new CustomError(404, "SubCategories not found");
  }
  APIResponse.success(
    res,
    200,
    "SubCategories fetched successfully!",
    subCategories
  );
});

// get single subcategory by slug
exports.getSingleSubCategory = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const subCategory = await SubCategory.findOne({ slug });
  if (!subCategory) {
    throw new CustomError(404, "SubCategory not found");
  }
  APIResponse.success(
    res,
    200,
    "SubCategory fetched successfully!",
    subCategory
  );
});

// update subcategory
exports.updateSubcategory = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const subCategory = await SubCategory.findOne({ slug });
  if (!subCategory) {
    throw new CustomError(404, "SubCategory not found");
  }
  if (req.body.name) {
    subCategory.name = req.body.name;
  }
  // update subcategory
  if (req.body.category) {
    // add subcategory into category
    const updateCategory = await CategoryModel.findOneAndUpdate(
      { _id: req.body.category },
      { $push: { subCategory: subCategory._id } },
      { new: true }
    );
    if (!updateCategory) {
      throw new CustomError(404, "Category not found");
    }
    // remove subcategory from category
    const updatedSubCategory = await CategoryModel.findOneAndUpdate(
      { _id: subCategory.category },
      { $pull: { subCategory: subCategory._id } },
      { new: true }
    );
    if (!updatedSubCategory) {
      throw new CustomError(404, "SubCategory not found");
    }
    subCategory.category = req.body.category || subCategory.category;
  }
  await subCategory.save();
  APIResponse.success(
    res,
    200,
    "SubCategory updated successfully!",
    subCategory
  );
});

// delete subcategory
exports.deleteSubcategory = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const subCategory = await SubCategory.findOne({ slug });
  if (!subCategory) {
    throw new CustomError(404, "SubCategory not found");
  }
  // remove subcategory from category
  const updatedSubCategory = await CategoryModel.findOneAndUpdate(
    { _id: subCategory.category },
    { $pull: { subCategory: subCategory._id } },
    { new: true }
  );
  if (!updatedSubCategory) {
    throw new CustomError(404, "SubCategory not found");
  }
  // delete subcategory
  await SubCategory.deleteOne({ _id: subCategory._id });
  APIResponse.success(
    res,
    200,
    "SubCategory deleted successfully!",
    subCategory
  );
});
