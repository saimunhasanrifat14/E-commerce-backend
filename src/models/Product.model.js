const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");

// review schema can be created later and referenced here
const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      max: 5,
      min: 0,
    },
    reviewer: {
      type: Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      trim: true,
      default: "",
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
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: [],
    rating: {
      type: Number,
      max: 5,
      default: 0,
    },
    wholeSalePrice: {
      type: Number,
    },
    retailPrice: {
      type: Number,
    },

    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },
    variant: [
      {
        type: Types.ObjectId,
        ref: "Variant",
        default: null,
      },
    ],
    stock: {
      type: Number,
    },
    tags: [
      {
        type: String,
      },
    ],
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    sku: {
      type: String,
      trim: true,
    },
    barCode: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    warrantyInformation: {
      type: String,
      default: "",
    },
    shippingInformation: {
      type: String,
      default: "",
    },
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    returnPolicy: {
      type: String,
      default: "",
    },
    minimumOrderQuantity: {
      type: Number,
      min: 5,
      default: 5,
    },
    manufactureCountry: {
      type: String,
      default: "",
    },
    size: [
      {
        type: String,
        default: "N/A",
      },
    ],
    color: [
      {
        type: String,
      },
    ],
    groupUnit: {
      type: String,
    },
    groupUnitQuantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      enum: ["Piece", "Kg", "Gram", "Packet", "Custom"],
      default: "Piece",
    },
    variantType: {
      type: String,
      enum: ["singleVariant", "multipleVariant"],
      default: "singleVariant",
    },
    warehouseLocation: [
      {
        type: Types.ObjectId,
        ref: "Warehouse",
      },
    ],
    alertQuantity: {
      type: Number,
      min: 4,
      default: 4,
    },
    stockAlert: {
      type: Boolean,
      default: false,
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

// Generate slug from product name
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
    });
  }
  next();
});

// Prevent duplicate slugs
productSchema.pre("save", async function (next) {
  const existingProduct = await this.constructor.findOne({
    slug: this.slug,
  });

  if (
    existingProduct &&
    existingProduct._id.toString() !== this._id.toString()
  ) {
    throw new Error("Product with this name already exists, try another name!");
  }

  next();
});

// Update slug on name change
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    this.setUpdate(update);

    // Check for duplicate slug
    const existingProduct = await this.model.findOne({ slug: update.slug });
    if (
      existingProduct &&
      existingProduct._id.toString() !== this.getQuery()._id?.toString()
    ) {
      throw new Error(
        "Product with this name already exists, try another name!"
      );
    }
  }
  next();
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
