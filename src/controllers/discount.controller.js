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

