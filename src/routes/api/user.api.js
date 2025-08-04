const express = require("express");
const router = express.Router();
const { register, login } = require("../../controllers/user.controller");

router.route("/registation").post(register);
router.route("/login").post(login);

module.exports = router;
