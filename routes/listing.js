/**
 * ! Every Thing Related To Listings
 * * Requiring Every Dependencies
 * ? Listing model is defined in model folder
 * ? wrapAync Function is defined in util folder
 * ? ExpressError class is defined in util folder
 * ? ListingSchema and ReviewSchema Validation is available in top of folder
 */
const wrapAsync = require("../utils/wrapAsyn.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/**
 * * Calling Express For Making App
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router();

/**
 * * Index Route & Create Route (/)
 * ? Fetches all listings and renders index.ejs template
 * ? Handles the creation of a new listing
 */
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

/**
 * * New Route
 * ? Renders the form to create a new listing
 */
router.get("/new", isLoggedIn, listingController.renderNewForm);

/**
 * * Show Route & Update Route &  Delete Route
 * ? Fetches a single listing by ID and renders show.ejs template
 * ? Updates an existing listing
 * ? Deletes a listing by ID
 */
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

/**
 * * Edit Route
 * ? Renders the form to edit an existing listing
 */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
