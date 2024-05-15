/**
 * ! Every Thing Related To Reviews
 * * Requiring Every Dependencies
 * ? Listing model is defined in model folder
 * ? wrapAync Function is defined in util folder
 * ? ExpressError class is defined in util folder
 * ? ListingSchema and ReviewSchema Validation is available in top of folder
 * ? Review Model is defined in model folder
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
 * * Calling Express For Making App
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router({ mergeParams: true });

/**
 * * Review Insertion Route
 * ? Insert the reviews with POST
 */
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.reviewInsert)
);

/**
 * * Review Deletion Route
 * ? Review will deleted from reviews collection and listings reviews array
 */
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
