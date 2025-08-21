const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/category.controller");
const { authGuard } = require("../../middleware/auth.guard.middleware");

router.route("/create-category").post(authGuard, createCategory);
router.route("/get-all-categories").get(getAllCategories);
router.route("/get-single-category/:id").get(getSingleCategory);
router.route("/update-category/:id").put(authGuard, updateCategory);
router.route("/delete-category/:id").delete(authGuard, deleteCategory);

module.exports = router;
