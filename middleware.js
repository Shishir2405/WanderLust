/**
 * ! Every MiddleWare To Be Used
 * * Imports necessary modules for the application.
 */

const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema } = require("./schema.js");
const Review = require("./models/review.js");

/**
 * * Check User Authentication
 * ? Verifies if the user is logged in by checking authentication status
 */
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please log in to create a new Listing");
    return res.redirect("/login");
  }
  next();
};

/**
 * * Save Redirect URL
 * ? Saves the redirect URL in session data to be used later.
 */
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

/**
 * * Check Ownership
 * ? Verifies if the current user owns the listing by comparing user IDs.
 */

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash(
      "error",
      "Access Denied: Only the Owner Can Update or Delete This Listing"
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

/**
 * * Validate Listing Schema Function
 * ? With Joi
 */
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/**
 * * Validate Review Schema Function
 * ? With Joi
 */
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/**
 * * Retrieves the review using its ID and verifies if the author matches the current user.
 * ? If the author doesn't match, redirects the user to the listing page with an error message.
 */

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Access Denied: You're not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
