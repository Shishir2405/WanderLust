/**
 * * Category Filter Routes
 * ? This module sets up routes to filter listings based on their category. Each category route fetches listings that match the specified category and renders the 'filter.ejs' template with the listings.
 */

const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");

// Define the enum values for categories
const categories = [
  "trending",
  "beach",
  "arctic",
  "outside",
  "iconic-city",
  "castles",
  "pool",
  "camping",
  "cabin",
  "farms",
  "mountain",
  "domes",
  "boats",
  "tropical",
  "windmill",
  "ski",
  "chef",
  "disabled",
  "play",
];

// Create a route for each category
categories.forEach((category) => {
  router.get(`/${category}`, async (req, res) => {
    try {
      let listings = await Listing.find({ category: category });
      res.render("listings/filter.ejs", {
        listings,
        category,
        includeNavBelow: true,
      });
    } catch (error) {
      console.error(`Error fetching listings for category ${category}:`, error);
      req.flash("error", "An error occurred while fetching listings.");
      res.redirect("/listings");
    }
  });
});

module.exports = router;
