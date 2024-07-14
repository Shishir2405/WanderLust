/**
 * ! Everything Related To Listings
 * * Requiring Every Dependency
 * ? wrapAsync Function is defined in utils folder
 * ? ExpressError class is defined in utils folder
 * ? Listing model is defined in models folder
 * ? ListingSchema and ReviewSchema Validation are available in schema.js
 */

const wrapAsync = require("../utils/wrapAsyn.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/**
 * * Initializing Express Router
 * * Create a new router instance for defining endpoint routes.
 */
const express = require("express");
const router = express.Router();

/**
 * * Index Route & Create Route (/)
 * ? GET: Fetches all listings and renders index.ejs template
 * ? POST: Handles the creation of a new listing
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
 * ? GET: Renders the form to create a new listing
 */
router.get("/new", isLoggedIn, listingController.renderNewForm);

/**
 * * Show Route, Update Route, Delete Route (/id)
 * ? GET: Fetches a single listing by ID and renders show.ejs template
 * ? PUT: Updates an existing listing
 * ? DELETE: Deletes a listing by ID
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
 * * Edit Route (/id/edit)
 * ? GET: Renders the form to edit an existing listing
 */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);



module.exports = router;
