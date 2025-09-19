const DiscountModel = require("../models/discount.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateDiscount } = require("../validation/discount.validation");
const CategoryModel = require("../models/category.model");
const SubCategoryModel = require("../models/subcategory.model");
const cache = require("node-cache");

// Create Discount
exports.createDiscount = AsyncHandler(async (req, res) => {
  const value = await validateDiscount(req);

  const discount = await new DiscountModel(value).save();
  if (!discount) {
    throw new CustomError(500, "Discount creation failed try again!");
  }
  // update category id into category collection
  if (value.discountPlan === "category" && value.category) {
    const updateCategory = await CategoryModel.findOneAndUpdate(
      { _id: value.category },
      { $push: { discount: discount._id } },
      { new: true }
    );
    if (!updateCategory) {
      throw new CustomError(404, "Category not found");
    }
  }
  //   update sub category id into sub category collection
  if (value.discountPlan === "subCategory" && value.subCategory) {
    const updateSubCategory = await SubCategoryModel.findOneAndUpdate(
      { _id: value.subCategory },
      { $push: { discount: discount._id } },
      { new: true }
    );
    if (!updateSubCategory) {
      throw new CustomError(404, "SubCategory not found");
    }
  }
  APIResponse(res, 201, discount, "Discount created successfully!");
});

// Get All Discount
exports.getAllDiscount = AsyncHandler(async (req, res) => {
  const allDiscount = cache.get("discount");
  if (allDiscount == undefined) {
    const discount = await DiscountModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "category subCategory",
      });
    if (!discount) {
      throw new CustomError(404, "Discount not found");
    }
    cache.set("discount", JSON.stringify(discount), 60 * 60 * 24);
    APIResponse(res, 200, discount, "Discount fetched successfully!");
  } else {
    APIResponse(res, 200, allDiscount, "Discount fetched successfully!");
  }
});

// Get Single Discount by slug
exports.getSingleDiscount = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const discount = await DiscountModel.findOne({ slug }).populate({
    path: "category subCategory",
  });
  if (!discount) {
    throw new CustomError(404, "Discount not found");
  }
  APIResponse(res, 200, discount, "Discount fetched successfully!");
});

// update discount
exports.updateDiscount = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const discount = await DiscountModel.findOneAndUpdate({ slug });
  if (!discount) {
    throw new CustomError(404, "Discount not found");
  }
  // remove category id
  if (discount.discountPlan === "category" && discount.category) {
    const updateCategory = await CategoryModel.findByIdAndUpdate(
      { _id: discount.category },
      { $pull: { discount: discount._id } },
      { new: true }
    );
    if (!updateCategory) {
      throw new CustomError(404, "Category not found");
    }
  }
  //   remove sub category id
  if (discount.discountPlan === "subCategory" && discount.subCategory) {
    const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(
      { _id: discount.subCategory },
      { $pull: { discount: discount._id } },
      { new: true }
    );
    if (!updateSubCategory) {
      throw new CustomError(404, "SubCategory not found");
    }
  }
  //   now update the discount by id
  if (discount.discountPlan === "category" && req.body.category) {
    const updateCategory = await CategoryModel.findByIdAndUpdate(
      { _id: req.body.category },
      { $push: { discount: discount._id } },
      { new: true }
    );
    if (!updateCategory) {
      throw new CustomError(404, "Category not found");
    }
  }
  // update the sub category id into sub category collection
  if (discount.discountPlan === "subCategory" && req.body.subCategory) {
    const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(
      { _id: req.body.subCategory },
      { $push: { discount: discount._id } },
      { new: true }
    );
    if (!updateSubCategory) {
      throw new CustomError(404, "SubCategory not found");
    }
  }
  //   finally update the discount
  const updatedDiscount = await DiscountModel.findByIdAndUpdate(
    { _id: discount._id },
    { ...req.body },
    { new: true }
  );
  if (!updatedDiscount) {
    //   remove category id
    if (discount.discountPlan === "category" && discount.category) {
      await CategoryModel.findByIdAndUpdate(discount.category, {
        discount: discount._id,
      });
    }
    //   remove sub category id
    if (discount.discountPlan === "subCategory" && discount.subCategory) {
      await SubCategoryModel.findByIdAndUpdate(discount.subCategory, {
        discount: discount._id,
      });
    }
    throw new CustomError(400, "Failed to update discount");
  }

  APIResponse(res, 200, discount, "Discount updated successfully!");
});
