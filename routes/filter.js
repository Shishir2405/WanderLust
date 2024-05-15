// const express = require("express");
// const router = express.Router();

// const Listing = require("../models/listing.js");

// router.get("/trend", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Beach", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Arctic", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Country-outside", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Iconic-city", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Castles", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Pool", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/cabin", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/farms", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/mountain", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/domes", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/boats", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/tropical", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/windmill", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/ski", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/chef", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/Disabled", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// router.get("/play", async (req, res) => {
//   let listing = await Listing.find({ category: "trending" });
//   res.render("listings/filter.ejs", { listing });
// });
// module.exports = router;
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
    res.render("listings/filter.ejs", { listing });
  });
});

module.exports = router;
