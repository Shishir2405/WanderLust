/**
 * * User Controller
 * ? This module contains all the controller functions for user-related routes, including sign-up, login, logout, and wishlist management.
 */

const User = require("../models/user.js");

/**
 * * Render Sign-Up Form
 * ? Renders the sign-up form for new users.
 */
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

/**
 * * Sign-Up User
 * ? Handles the sign-up process for new users, registers them, logs them in, and redirects to the listings page.
 */
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome To WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("alert", err.message);
    res.redirect("/signup");
  }
};

/**
 * * Log In User
 * ? Handles the login process for users and redirects them to the appropriate page.
 */
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back To WanderLust");
  let redirect = res.locals.redirectUrl || "/listings";
  res.redirect(redirect);
};

/**
 * * Render Login Form
 * ? Renders the login form for users.
 */
module.exports.renderLoginForm = async (req, res) => {
  res.render("users/login.ejs");
};

/**
 * * Log Out User
 * ? Logs the user out and redirects to the listings page.
 */
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've been successfully logged out");
    res.redirect("/listings");
  });
};

/**
 * * Render Wishlist
 * ? Renders the wishlist page for the logged-in user.
 */
module.exports.renderWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteListings");
    res.render("users/wishlists", { currUser: user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error rendering wishlist.");
    res.redirect("/");
  }
};

/**
 * * Add to Wishlist
 * ? Adds a listing to the user's wishlist if it is not already present.
 */
module.exports.addToWishlist = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      if (!user.favoriteListings.includes(listingId)) {
        user.favoriteListings.push(listingId);
        await user.save();
        req.flash("success", "Listing added to wishlist successfully.");
        res.redirect("/wishlists");
      } else {
        req.flash("error", "Listing already exists in wishlist.");
        res.redirect("/wishlists");
      }
    } else {
      req.flash("error", "User not found.");
      res.redirect("/listings/" + listingId);
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal server error.");
    res.redirect("/listings/" + listingId);
  }
};

/**
 * * Remove from Wishlist
 * ? Removes a listing from the user's wishlist.
 */
module.exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, {
        $pull: { favoriteListings: listingId },
      });
      req.flash("success", "Listing removed from wishlist successfully.");
      res.redirect("/wishlists");
    } else {
      req.flash("error", "User not found.");
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal server error.");
    res.redirect(`/listings/${listingId}`);
  }
};
