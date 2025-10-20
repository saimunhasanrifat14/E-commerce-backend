const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");
const { customError } = require("../utilities/CustomError");

const variantSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    slug: {
      type: String,
    },
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    stockVariant: {
      type: Number,
      required: true,
    },
    alertVariantStock: {
      type: Number,
      required: true,
    },
    retailPrice: {
      type: Number,
      required: true,
    },
    wholeSalePrice: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    image: [{}],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
variantSchema.pre("save", async function (next) {
  if (this.isModified("variantName")) {
    this.slug = await slugify(this.variantName, {
      replacement: "-",
      lower: false,
      strict: false,
    });
  }
  next();
});

// Check if variant with the same slug already exists
variantSchema.pre("save", async function (next) {
  const findVariant = await this.constructor.findOne({ slug: this.slug });
  if (findVariant && findVariant._id.toString() !== this._id.toString()) {
    throw new customError(
      401,
      "Variant with the same slug already exists. Please choose another name."
    );
  }
  next();
});

module.exports =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
