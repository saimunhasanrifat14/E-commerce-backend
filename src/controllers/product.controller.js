const { apiResponse } = require("../utilities/apiResponse");
const { asynchandeler } = require("../utilities/asynchandeler");
const { CustomError } = require("../utilities/CustomError");
const productModel = require("../models/product.model");
const { validateProduct } = require("../validation/product.validation");
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require("../helper/cloudinary");
const {
  generateProductQRCode,
  generateBarCode,
} = require("../helper/codeGenerator");

/**
 * Create a new product
 */
exports.createProduct = asynchandeler(async (req, res) => {
  const data = await validateProduct(req);

  // Upload images to Cloudinary
  const imagesArray = await Promise.all(
    data.images.map((img) => uploadCloudinaryFile(img.path))
  );

  // Create new product
  const product = await productModel.create({
    ...data,
    image: imagesArray,
  });
  if (!product) throw new CustomError(400, "Product creation failed");

  // Generate QR code & barcode
  const link = `${process.env.FRONTEND_URL}/product/${product.slug}`;
  const barCodeText = `${product.sku}-${product.name.slice(
    0,
    3
  )}-${new Date().getFullYear()}`;
  product.qrCode = await generateProductQRCode(link);
  product.barCode = await generateBarCode(barCodeText);
  await product.save();

  apiResponse.sendSucess(res, 201, "Product created successfully", product);
});

/**
 * Get all products with sorting
 */
exports.getAllProducts = asynchandeler(async (req, res) => {
  const sortOptions = {
    "date-descending": { createdAt: -1 },
    "date-ascending": { createdAt: 1 },
    "price-ascending": { retailPrice: 1 },
    "price-descending": { retailPrice: -1 },
    "alpha-ascending": { name: 1 },
    "alpha-descending": { name: -1 },
  };

  const sortQuery = sortOptions[req.query.sort] || { createdAt: -1 };

  const products = await productModel
    .find()
    .sort(sortQuery)
    .populate("category brand subCategory variant");

  apiResponse.sendSucess(res, 200, "Products fetched successfully", products);
});

/**
 * Get single product by slug
 */
exports.getSingleProduct = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(400, "Product slug is required");

  const product = await productModel
    .findOne({ slug })
    .populate("category brand subCategory");

  if (!product) throw new CustomError(404, "Product not found");

  apiResponse.sendSucess(res, 200, "Product fetched successfully", product);
});

/**
 * Update product information by slug
 */
exports.updateProductinfoBySlug = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(400, "Product slug is required");

  const product = await productModel.findOneAndUpdate({ slug }, req.body, {
    new: true,
  });

  if (!product) throw new CustomError(404, "Product not found");

  apiResponse.sendSucess(res, 200, "Product updated successfully", product);
});

/**
 * Update product images by slug
 */
exports.updateProductImagesBySlug = asynchandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(400, "Product slug is required");

  const product = await productModel.findOne({ slug });
  if (!product) throw new CustomError(404, "Product not found");

  // Delete selected images
  if (req.body.imageurl?.length) {
    for (const publicId of req.body.imageurl) {
      await deleteCloudinaryFile(publicId);
      product.image = product.image.filter((img) => img.publicId !== publicId);
    }
  }

  // Upload new images
  const newImages = req.files?.image?.length
    ? await Promise.all(
        req.files.image.map((f) => uploadCloudinaryFile(f.path))
      )
    : [];

  if (newImages.length) {
    product.image.push(...newImages);
    await product.save();
  }

  apiResponse.sendSucess(
    res,
    200,
    "Product images updated successfully",
    product
  );
});

/**
 * Filter products by category, brand, subcategory, tag, or price
 */
exports.filterProducts = asynchandeler(async (req, res) => {
  const { category, brand, subCategory, minPrice, maxPrice, tag } = req.query;

  const filterQuery = {
    ...(category && { category }),
    ...(subCategory && { subCategory }),
    ...(tag && { tag: Array.isArray(tag) ? { $in: tag } : tag }),
    ...(brand && { brand: Array.isArray(brand) ? { $in: brand } : brand }),
  };

  if (minPrice && maxPrice) {
    filterQuery.retailPrice = { $gte: +minPrice, $lte: +maxPrice };
  }

  const products = await productModel.find(filterQuery);
  if (!products.length) throw new CustomError(404, "No products found");

  apiResponse.sendSucess(res, 200, "Products filtered successfully", products);
});

/**
 * Filter products by price range
 */
exports.filterProductsByPriceRange = asynchandeler(async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  if (!minPrice || !maxPrice)
    throw new CustomError(400, "Min and Max price are required");

  const products = await productModel.find({
    retailPrice: { $gte: +minPrice, $lte: +maxPrice },
  });

  if (!products.length) throw new CustomError(404, "No products found");

  apiResponse.sendSucess(res, 200, "Products filtered by price", products);
});

/**
 * Paginate products
 */
exports.productPagination = asynchandeler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    productModel.find().skip(skip).limit(limit),
    productModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  apiResponse.sendSucess(res, 200, "Products paginated successfully", {
    page,
    limit,
    totalPages,
    totalCount,
    products,
  });
});

/**
 * Search products by name or SKU
 */
exports.searchProducts = asynchandeler(async (req, res) => {
  const { query } = req.query;
  if (!query) throw new CustomError(400, "Search query is required");

  const products = await productModel.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { sku: { $regex: query, $options: "i" } },
    ],
  });

  if (!products.length)
    throw new CustomError(404, "No matching products found");

  apiResponse.sendSucess(res, 200, "Products searched successfully", products);
});
