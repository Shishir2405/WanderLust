/**
 * * Review Controller
 * ? This module contains all the controller functions for review-related routes, including creating and deleting reviews.
 */

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

/**
 * * New Review Creation Route
 * ? Handles the creation of a new review, associates it with a listing, and saves it.
 */
module.exports.reviewInsert = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Created!!!");

  res.redirect(`/listings/${id}`);
};

/**
 * * Delete Review Route
 * ? Handles the deletion of a review from a listing and removes it from the database.
 */
module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted");

  res.redirect(`/listings/${id}`);
};
