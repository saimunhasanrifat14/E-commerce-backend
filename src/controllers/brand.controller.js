const Brand = require("../models/brand.model");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { APIResponse } = require("../utilities/APIResponse");
const { CustomError } = require("../utilities/CustomError");
const { validateBrand } = require("../validation/brand.validation");
const { uploadImage, deleteImage } = require("../helpers/cloudinary");

// create brand
exports.createBrand = AsyncHandler(async (req, res) => {
  const value = await validateBrand(req);
  const { name, image } = value;
  const uploadedImage = await uploadImage(image.path);
  const brand = await new Brand({ name, image: uploadedImage }).save();
  if (!brand) {
    throw new CustomError(500, "Brand creation failed try again!");
  }
  APIResponse.success(res, 201, brand, "Brand created successfully!");
});

// update brand
exports.updateBrand = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = await Brand.findOne({ slug });
  if (!brand) {
    throw new CustomError(404, "Brand not found");
  }

  if (req.file) {
    await deleteImage(brand.image.public_id);
    const uploadedImage = await uploadImage(req.file.path);
    brand.image = uploadedImage;
  }

  if (req.body.name) {
    brand.name = req.body.name;
  }
  await brand.save();
  APIResponse.success(res, 200, brand, "Brand updated successfully!");
});

// delete brand
exports.deleteBrand = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = await Brand.findOneAndDelete({ slug });
  if (!brand) {
    throw new CustomError(404, "Brand not found");
  }
  await deleteImage(brand.image.public_id);
  APIResponse.success(res, 200, brand, "Brand deleted successfully!");
});

// get all brands
exports.getAllBrands = AsyncHandler(async (req, res) => {
  const brands = await Brand.find({});
  if (!brands) {
    throw new CustomError(404, "Brands not found");
  }
  APIResponse.success(res, 200, brands, "Brands fetched successfully!");
});

// get single brand
exports.getSingleBrand = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = await Brand.findOne({ slug });
  if (!brand) {
    throw new CustomError(404, "Brand not found");
  }
  APIResponse.success(res, 200, brand, "Brand fetched successfully!");
});
