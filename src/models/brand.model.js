const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

// Brand Schema
const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
    },
    image: {},
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
brandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = await slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
    });
  }
  next();
});

// Check if slug already exists
brandSchema.pre("save", async function (next) {
  const existingBrand = await this.constructor.findOne({
    slug: this.slug,
  });

  if (existingBrand && existingBrand._id.toString() !== this._id.toString()) {
    throw new Error("Brand already exists, try another name!");
  }

  next();
});

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
