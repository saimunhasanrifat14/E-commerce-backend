const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/category.controller");
const { upload } = require("../../middleware/multer.middleware");

router
  .route("/create-category")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    createCategory
  );
router.route("/get-all-categories").get(getAllCategories);
router.route("/get-single-category/:slug").get(getSingleCategory);
router
  .route("/update-category/:slug")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    updateCategory
  );
router.route("/delete-category/:slug").delete(deleteCategory);

module.exports = router;
