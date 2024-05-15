/**
 * ! Every Thing Related To Users
 * * Imports necessary modules for the application.
 */

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsyn.js");

/**
 * * Calling Express For Making App
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");

/**
 * * Route for rendering sign up form
 * * Route for handling sign up form submission
 */
router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signup));

/**
 * * Route for rendering login form
 * * Route for handling login form submission
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
 * * Route for handling user logout
 */
router.get("/logout", userController.logout);

module.exports = router;
