const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { customError } = require("../utils/customError");
const roleSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

// Check if variant with the same slug already exists
roleSchema.pre("save", async function (next) {
  const findRole = await this.constructor.findOne({ name: this.name });
  if (findRole && findRole._id.toString() !== this._id.toString()) {
    throw new customError(
      401,
      "role name already exists. Please choose another name."
    );
  }
  next();
});

module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);