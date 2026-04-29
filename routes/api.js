const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsyn.js");

const SEARCH_LIMIT = 8;
const SEARCH_LIMIT_MAX = 24;

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const q = (req.query.q || "").toString().trim();
    const category = (req.query.category || "").toString().trim();
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const limit = Math.min(
      Number(req.query.limit) || SEARCH_LIMIT,
      SEARCH_LIMIT_MAX
    );

    const filter = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: re }, { location: re }, { country: re }];
    }
    if (category) filter.category = category;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      filter.price = {};
      if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
      if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
    }

    const listings = await Listing.find(filter)
      .select("title location country price image category")
      .limit(limit)
      .lean();

    res.json({
      query: { q, category, minPrice, maxPrice },
      count: listings.length,
      results: listings.map((l) => ({
        id: String(l._id),
        title: l.title,
        location: l.location,
        country: l.country,
        price: l.price,
        category: l.category,
        thumbnail: l.image && l.image.url,
      })),
    });
  })
);

module.exports = router;
