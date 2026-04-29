/**
 * * Profile Controller
 * ? Handles rendering and updating the current user's profile (display name,
 * ? bio, and avatar). Avatar uploads use the shared Cloudinary multer storage.
 */

const User = require("../models/user.js");

/**
 * * Render the current user's profile edit page.
 */
module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/listings");
  }
  res.render("users/profile.ejs", { profileUser: user });
};

/**
 * * Update the current user's profile fields. If a file is present on
 * * `req.file`, it is treated as the new avatar and stored on Cloudinary.
 */
module.exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/listings");
  }

  const { displayName, bio } = req.body || {};

  if (typeof displayName === "string") {
    user.displayName = displayName.trim();
  }

  if (typeof bio === "string") {
    user.bio = bio.slice(0, 280);
  }

  if (req.file && req.file.path) {
    user.avatar = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await user.save();
  req.flash("success", "Profile updated");
  res.redirect("/me");
};
