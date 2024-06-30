/**
 * ! Everything Related To Reviews
 * * Requiring Every Dependency
 * ? wrapAsync Function is defined in utils folder
 * ? ExpressError class is defined in utils folder
 * ? Listing model is defined in models folder
 * ? Review model is defined in models folder
 * ? ListingSchema and ReviewSchema Validation are available in schema.js
 */

const wrapAsync = require("../utils/wrapAsyn.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { reviewSchema, listingSchema } = require("../schema.js");
const Review = require("../models/review.js");
const reviewController = require("../controller/reviews.js");
const {
  isLoggedIn,
  validateReview,
  isReviewAuthor,
} = require("../middleware.js");

/**
 * * Initializing Express Router
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router({ mergeParams: true });

/**
 * * Review Insertion Route
 * ? POST: Insert a new review for a listing
 */
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.reviewInsert)
);

/**
 * * Review Deletion Route
 * ? DELETE: Delete a review from the reviews collection and from the listing's reviews array
 */
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
