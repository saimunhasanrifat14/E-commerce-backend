const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/user.api"));
router.use("/category", require("./api/category.api"));
router.use("/subcategory", require("./api/subcategory.api"));
router.use("/brand", require("./api/brand.api"));

module.exports = router;
