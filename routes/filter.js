
const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");

// Define the enum values
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
  "play"
];

categories.forEach(category => {
  router.get(`/${category}`, async (req, res) => {
    let listing = await Listing.find({ category: category });
    res.render("listings/filter.ejs", { listing ,category });
  });
});

module.exports = router;
