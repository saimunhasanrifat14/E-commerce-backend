require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CustomError } = require("../utilities/CustomError");
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRECT,
});

// upload image
exports.uploadImage = async (filePath) => {
  try {
    // check file path
    if (!filePath && !fs.existsSync(filePath)) {
      throw new CustomError(400, "File path is required");
    }

    // upload image
    const uploadedImage = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      quality: "auto",
    });

    // check image is uploaded or not if uploaded then delete file from temp folder
    if (uploadedImage) {
      fs.unlinkSync(filePath);
      return { public_id: uploadedImage.public_id, url: uploadedImage.url };
    }
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("error from cloudinary file upload ", error);
    throw new CustomError(
      500,
      "error from cloudinary file upload " + error.message
    );
  }
};

// delete image
exports.deleteImage = async (public_id) => {
  try {
    // check public id
    if (!public_id) {
      throw new CustomError(400, "Public id is required");
    }
    // delete image
    const deletedImage = await cloudinary.uploader.destroy(public_id);
    // check image is deleted or not
    if (deletedImage) {
      return true;
    }
  } catch (error) {
    console.log("Error deleting image:", error.message);
    throw new CustomError(500, "Failed to delete image" + error.message);
  }
};
