/**
 * ! Everything Related To Users
 * * Imports necessary modules for the application.
 */

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsyn.js");

/**
 * * Initializing Express Router
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");

/**
 * * User Signup Routes
 * ? GET: Renders the signup form.
 * ? POST: Handles the signup form submission.
 */
router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signup));

/**
 * * User Login Routes
 * ? GET: Renders the login form.
 * ? POST: Handles the login form submission.
 */
router
  .route("/login")
  .get(wrapAsync(userController.renderLoginForm))
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

/**
 * * User Logout Route
 * ? GET: Handles user logout.
 */
router.get("/logout", userController.logout);

/**
 * * User Wishlist Routes
 * ? GET: Renders the user's wishlist.
 * ? POST: Adds a listing to the user's wishlist.
 * ? POST: Removes a listing from the user's wishlist.
 */
router.get("/wishlists", userController.renderWishlist);
router.post("/wishlists/add", userController.addToWishlist);
router.post("/wishlists/remove", userController.removeFromWishlist);

module.exports = router;
