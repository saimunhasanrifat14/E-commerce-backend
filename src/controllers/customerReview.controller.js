const { apiResponse } = require("../utilities/apiResponse");
const { asynchandeler } = require("../utilities/asynchandeler");
const { CustomError } = require("../utilities/CustomError");
const productModel = require("../models/product.model");
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require("../helper/cloudinary");
const { validateReview } = require("../validation/customerReview.validation");

/**
 * @desc Create a new customer review
 * @route POST /api/reviews
 */
exports.createCustomerReview = asynchandeler(async (req, res) => {
  // Validate review data
  const data = await validateReview(req);

  // Upload images to Cloudinary (if any)
  const imageUrls = data.image?.length
    ? await Promise.all(data.image.map((img) => uploadCloudinaryFile(img.path)))
    : [];

  // Save review inside the product document
  const updatedProduct = await productModel.findByIdAndUpdate(
    data.product,
    {
      $push: { reviews: { ...data, image: imageUrls } },
    },
    { new: true }
  );

  if (!updatedProduct) throw new CustomError(404, "Product not found!");

  apiResponse.sendSucess(res, 200, "Review created successfully", updatedProduct);
});

/**
 * @desc Delete a product review
 * @route DELETE /api/reviews/:slug
 */
exports.deleteProdutReview = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  const { reviewId } = req.body;

  if (!slug) throw new CustomError(400, "Product slug is required!");
  if (!reviewId) throw new CustomError(400, "Review ID is required!");

  // Remove review from the product
  const updatedProduct = await productModel.findOneAndUpdate(
    { slug },
    { $pull: { reviews: { _id: reviewId } } },
    { new: true }
  );

  if (!updatedProduct) throw new CustomError(404, "Review not found!");

  apiResponse.sendSucess(res, 200, "Review deleted successfully", updatedProduct);
});

/**
 * @desc Update a product review (comment only)
 * @route PUT /api/reviews
 */
exports.editProdutReview = asynchandeler(async (req, res) => {
  const { reviewId, comment } = req.body;

  if (!reviewId) throw new CustomError(400, "Review ID is required!");
  if (!comment?.trim()) throw new CustomError(400, "Comment cannot be empty!");

  // Update review comment
  const updatedProduct = await productModel.findOneAndUpdate(
    { "reviews._id": reviewId },
    { $set: { "reviews.$.comment": comment.trim() } },
    { new: true }
  );

  if (!updatedProduct) throw new CustomError(404, "Review not found!");

  apiResponse.sendSucess(res, 200, "Review updated successfully", updatedProduct);
});
