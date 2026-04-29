const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

module.exports.dashboard = async (req, res) => {
  if (!req.user) {
    req.flash("error", "Sign in to access your host dashboard.");
    return res.redirect("/login");
  }

  const listings = await Listing.find({ owner: req.user._id })
    .populate({ path: "reviews", select: "rating" })
    .lean();

  const wishlistedCounts = await Promise.all(
    listings.map((l) =>
      User.countDocuments({ favoriteListings: l._id }).then((count) => ({
        id: String(l._id),
        count,
      }))
    )
  );
  const wishlistMap = Object.fromEntries(
    wishlistedCounts.map((w) => [w.id, w.count])
  );

  let totals = {
    listings: listings.length,
    views: 0,
    reviews: 0,
    wishlists: 0,
    avgRating: 0,
  };
  let allRatings = [];
  let starBuckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const enriched = listings.map((l) => {
    const reviewCount = (l.reviews || []).length;
    const ratingSum = (l.reviews || []).reduce(
      (s, r) => s + (Number(r.rating) || 0),
      0
    );
    const avg = reviewCount ? ratingSum / reviewCount : 0;
    (l.reviews || []).forEach((r) => {
      const k = Number(r.rating);
      if (starBuckets[k] !== undefined) starBuckets[k] += 1;
      allRatings.push(k);
    });
    totals.views += l.views || 0;
    totals.reviews += reviewCount;
    totals.wishlists += wishlistMap[String(l._id)] || 0;
    return {
      id: String(l._id),
      title: l.title,
      image: l.image && l.image.url,
      price: l.price,
      views: l.views || 0,
      reviewCount,
      avgRating: avg,
      wishlistCount: wishlistMap[String(l._id)] || 0,
    };
  });

  totals.avgRating =
    allRatings.length > 0
      ? allRatings.reduce((s, n) => s + n, 0) / allRatings.length
      : 0;

  enriched.sort((a, b) => b.views - a.views);

  res.render("host/dashboard.ejs", {
    listings: enriched,
    totals,
    starBuckets,
  });
};
