const { apiResponse } = require("../utilities/apiResponse");
const { asynchandeler } = require("../utilities/asynchandeler");
const { CustomError } = require("../utilities/CustomError");
const variantModel = require("../models/variant.model");
const productModel = require("../models/product.model");
const { validateVariant } = require("../validation/variant.validation");
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require("../helper/cloudinary");
const { promises } = require("nodemailer/lib/xoauth2");
// create variant
exports.createVariant = asynchandeler(async (req, res) => {
  const data = await validateVariant(req);
  //  upload image
  const imageUrl = await Promise.all(
    data.image.map((img) => uploadCloudinaryFile(img.path))
  );
  // now save the data into database
  const variant = await variantModel.create({ ...data, image: imageUrl });
  if (!variant) throw new CustomError(500, "variant created failed !!");

  //   find the product model and push new variant id
  const updateProductvariant = await productModel.findOneAndUpdate(
    { _id: data.product },
    { $push: { variant: variant._id } },
    { new: true }
  );
  if (!updateProductvariant)
    throw new CustomError(500, "variant id pushed failed !!");
  apiResponse.sendSucess(res, 201, "variant created sucessfully", variant);
});

// get all variant
exports.getAllVariant = asynchandeler(async (req, res) => {
  const variants = await variantModel
    .find()
    .populate("product") // populate product details
    .sort({ createdAt: -1 }); // latest first

  if (!variants || variants.length === 0) {
    throw new CustomError(404, "No variants found!");
  }

  apiResponse.sendSucess(res, 200, "Variants fetched successfully", variants);
});

// get single variant
exports.singleVariant = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "slug not found !");
  const variants = await variantModel.findOne({ slug }).populate("product"); // populate product details
  if (!variants) {
    throw new CustomError(404, "No variants found!");
  }
  apiResponse.sendSucess(res, 200, "Variants fetched successfully", variants);
});

// upload variant
exports.uploadVariantImage = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "slug not found !");
  const variants = await variantModel.findOne({ slug });
  if (!variants) {
    throw new CustomError(404, "No variants found!");
  }
  const { image } = req.files;
  const imageUrl = await Promise.all(
    image.map((image) => uploadCloudinaryFile(image.path))
  );
  variants.image = [...variants.image, ...imageUrl];
  await variants.save();
  apiResponse.sendSucess(
    res,
    200,
    "Variants new image upload sucessfully",
    variants
  );
});

// delete images
exports.deleteVariantImage = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  const { publicId } = req.body;
  if (!slug) throw new CustomError(401, "slug not found !");
  const variant = await variantModel.findOne({ slug });
  if (!variant) {
    throw new CustomError(404, "No variants found!");
  }
  // delete image form cloudinary
  const resposne = await Promise.all(
    publicId.map((id) => deleteCloudinaryFile(id))
  );
  if (!resposne) throw new CustomError(404, " variants image delete failed!");

  // remove images from variant.image

  variant.image = variant.image.filter(
    (img) => !publicId.includes(img.publicIP)
  );

  await variant.save();

  apiResponse.sendSucess(
    res,
    200,
    "Variants new image upload sucessfully",
    variant
  );
});

// update varinatinfo

exports.updateVariantInfo = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "slug not found !");
  const existingVariant = await variantModel.findOne({ slug });
  if (!existingVariant) {
    throw new CustomError(404, "No variants found!");
  }

  // check product id is matched or not matched
  const isMatched = existingVariant.product.toString() !== req.body.product;
  const updateVariant = await variantModel.findOneAndUpdate(
    { slug },
    req.body,
    { new: true }
  );
  if (!updateVariant) throw new CustomError(404, "No variants found!");
  if (isMatched) {
    // remove variant id from old product
    await productModel.findOneAndUpdate(
      { _id: existingVariant.product },
      { $pull: { variant: existingVariant._id } }
    );
    // add variant id to new product
    await productModel.findOneAndUpdate(
      { _id: req.body.product },
      { $push: { variant: existingVariant._id } }
    );
  }

  apiResponse.sendSucess(
    res,
    200,
    "Variants new image upload sucessfully",
    updateVariant
  );
});