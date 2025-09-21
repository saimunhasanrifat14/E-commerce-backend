const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");
const { CustomError } = require("../utilities/CustomError");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {},
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    subCategory: [
      {
        type: Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    discount: {
      type: Types.ObjectId,
      ref: "Discount",
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
// make slug
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
  next();
});

// check already exist this cateogry or not
categorySchema.pre("save", async function (next) {
  const findCategory = await this.constructor.findOne({ slug: this.slug });
  if (findCategory && findCategory._id.toString() !== this._id.toString()) {
    throw new CustomError(400, "Category already Exist try anther name!");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
