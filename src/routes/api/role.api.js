const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/role.controller");
router.route("/create-role").post(roleController.createRole);

module.exports = router;