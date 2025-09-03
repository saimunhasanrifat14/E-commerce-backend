const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");

// SubCategory Schema
const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    discount: {
      type: Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    slug: {
      type: String,
    },
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
subCategorySchema.pre("save", async function (next) {
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
subCategorySchema.pre("save", async function (next) {
  const existingSubCategory = await this.constructor.findOne({
    slug: this.slug,
  });

  if (
    existingSubCategory &&
    existingSubCategory._id.toString() !== this._id.toString()
  ) {
    throw new Error("SubCategory already exists, try another name!");
  }

  next();
});
const categoryPopulate = async function (next) {
  this.populate({
    path: "category",
  });
  next();
};

const sortsubCategory = async function (next) {
  this.sort({ createdAt: -1 });
  next();
};

subCategorySchema.pre("find", sortsubCategory, categoryPopulate);
subCategorySchema.pre("findOne", categoryPopulate);

module.exports =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
