/**
 * * Requiring Every Dependencies
 */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/**
 * * Configure Cloudinary
 * ? Configures Cloudinary with API credentials and options for image storage.
 */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/**
 * * Configure Cloudinary Storage
 * ? Configures CloudinaryStorage with Cloudinary and parameters for image storage.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "WanderLust_DEV",
    allowedFormat: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
