const express = require("express");
const router = express.Router();
const { createCategory } = require("../../controllers/category.controller");
const { authGuard } = require("../../middleware/auth.guard.middleware");

router.route("/create-category").post(authGuard, createCategory);

module.exports = router;
