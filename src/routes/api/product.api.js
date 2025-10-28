const express = require("express");
const router = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const productController = require("../../controllers/product.controller");

router.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.createProduct
);
router.route("/get-products").get(productController.getAllProducts);
router.route("/single-products/:slug").get(productController.getSingleProduct);
router.route("/update-productinfo/:slug").put(
  productController.updateProductinfoBySlug
);
router.route("/update-productimage/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.updateProductImagesBySlug
);
router.route("/filter-products").get(productController.filterProducts);
router.route("/filter-pricerange").get(productController.filterProductsByPriceRange);
router.route("/product-pagination").get(productController.productPagination);
router.route("/search-products").get(productController.searchProducts);

module.exports = router;