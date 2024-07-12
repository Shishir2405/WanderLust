/**
 * * Listing Controller
 * ? This module contains all the controller functions for listing-related routes, including creating, updating, deleting, and displaying listings.
 */

const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/**
 * * All Listing Route
 * ? Retrieves and displays all listings with their average ratings.
 */
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).populate("reviews");

  allListings.forEach((listing) => {
    if (listing.reviews.length > 0) {
      const totalRating = listing.reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      listing.averageRating = totalRating / listing.reviews.length;
    } else {
      listing.averageRating = 0;
    }
  });

  res.render("listings/index.ejs", { allListings, includeNavBelow: true });
};

/**
 * * Render Form For New Listing
 * ? Renders the form for creating a new listing.
 */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/**
 * * Specific Listing Route
 * ? Retrieves and displays a specific listing, including its reviews and average rating.
 */
module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "The requested listing does not exist.");
      return res.redirect("/listings");
    }

    // Calculate average rating
    let averageRating = 0;
    let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingPercentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (listing.reviews && listing.reviews.length > 0) {
      const totalRating = listing.reviews.reduce((acc, review) => {
        ratingCounts[review.rating] += 1;
        return acc + review.rating;
      }, 0);
      averageRating = totalRating / listing.reviews.length;

      // Calculate percentage for each rating
      for (let i = 1; i <= 5; i++) {
        ratingPercentages[i] = (ratingCounts[i] / listing.reviews.length) * 100;
      }
    }

    res.render("listings/show.ejs", {
      listing,
      averageRating,
      ratingPercentages,
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "An error occurred while fetching the listing.");
    res.redirect("/listings");
  }
};


/**
 * * Create New Listing
 * ? Handles the creation of a new listing, including geocoding and saving to the database.
 */
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;
  newListing.category = req.body.listing.category;
  newListing.typeOfPlace = req.body.listing.typeOfPlace;
  newListing.bedrooms = req.body.listing.bedrooms;
  newListing.beds = req.body.listing.beds;
  newListing.locked = req.body.listing.locked;
  newListing.other = req.body.listing.other;
  let savedListing = await newListing.save();
  console.log(req.body.category);
  console.log(savedListing);

  req.flash("success", "New Listing Created!!!");

  res.redirect("/listings");
};

/**
 * * Render Edit Form
 * ? Renders the form for editing an existing listing.
 */
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing You Are Requested Does Not Exists");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");

  res.render("listings/editForm.ejs", { listing, originalImageUrl });
};

/**
 * * Update Listing Route
 * ? Handles the update of an existing listing and saves the changes to the database.
 */
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("update", "Listing Updated!!!");

  res.redirect(`/listings/${id}`);
};

/**
 * * Delete Listing Route
 * ? Handles the deletion of an existing listing from the database.
 */
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "Listing Deleted!!!");

  res.redirect("/listings");
};
