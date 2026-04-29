/**
 * ! Profile Routes
 * * Routes for the current user's own profile page (/me).
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsyn.js");
const { isLoggedIn } = require("../middleware.js");
const profileController = require("../controller/profile.js");

/**
 * * Profile Routes (/me)
 * ? GET: Renders the profile edit form for the current user.
 * ? PUT: Updates display name, bio and avatar (multipart, avatar field).
 */
router
  .route("/me")
  .get(isLoggedIn, wrapAsync(profileController.renderProfile))
  .put(
    isLoggedIn,
    upload.single("avatar"),
    wrapAsync(profileController.updateProfile)
  );

module.exports = router;
