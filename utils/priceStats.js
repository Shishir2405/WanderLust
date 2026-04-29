/**
 * Lightweight in-memory cache of price averages per (category, country).
 * Refreshes on a TTL — no external services, no model writes.
 */

const Listing = require("../models/listing.js");

const TTL_MS = 10 * 60 * 1000;
let cache = null;
let cacheBuiltAt = 0;
let inflight = null;

async function rebuild() {
  const buckets = await Listing.aggregate([
    {
      $match: { price: { $gt: 0 } },
    },
    {
      $group: {
        _id: { category: "$category", country: "$country" },
        avg: { $avg: "$price" },
        count: { $sum: 1 },
      },
    },
  ]);

  const next = {
    byCategoryCountry: new Map(),
    byCategory: new Map(),
    overall: 0,
    overallCount: 0,
  };

  let total = 0;
  let count = 0;
  const cTotals = new Map();

  for (const b of buckets) {
    const key = `${b._id.category || "_"}::${b._id.country || "_"}`;
    next.byCategoryCountry.set(key, { avg: b.avg, count: b.count });
    total += b.avg * b.count;
    count += b.count;
    const c = b._id.category || "_";
    const prev = cTotals.get(c) || { sum: 0, n: 0 };
    prev.sum += b.avg * b.count;
    prev.n += b.count;
    cTotals.set(c, prev);
  }

  for (const [c, t] of cTotals) {
    next.byCategory.set(c, { avg: t.sum / t.n, count: t.n });
  }

  next.overall = count ? total / count : 0;
  next.overallCount = count;
  cache = next;
  cacheBuiltAt = Date.now();
  return cache;
}

async function getStats() {
  if (cache && Date.now() - cacheBuiltAt < TTL_MS) return cache;
  if (inflight) return inflight;
  inflight = rebuild().finally(() => {
    inflight = null;
  });
  return inflight;
}

function comparePrice(price, avg) {
  if (!avg || !price) return null;
  const ratio = price / avg;
  if (ratio <= 0.85)
    return {
      tier: "great-deal",
      label: "Great deal",
      delta: Math.round((1 - ratio) * 100),
      avg,
    };
  if (ratio >= 1.2)
    return {
      tier: "premium",
      label: "Premium",
      delta: Math.round((ratio - 1) * 100),
      avg,
    };
  return {
    tier: "fair",
    label: "Fair price",
    delta: Math.round((ratio - 1) * 100),
    avg,
  };
}

async function tagListing(listing) {
  if (!listing || !listing.price) return null;
  const stats = await getStats();
  if (!stats) return null;
  const key = `${listing.category || "_"}::${listing.country || "_"}`;
  const ccBucket = stats.byCategoryCountry.get(key);
  // Need at least 3 listings in the bucket for a meaningful comparison
  if (ccBucket && ccBucket.count >= 3) {
    return comparePrice(listing.price, ccBucket.avg);
  }
  const cBucket = stats.byCategory.get(listing.category || "_");
  if (cBucket && cBucket.count >= 3) {
    return comparePrice(listing.price, cBucket.avg);
  }
  if (stats.overallCount >= 3) {
    return comparePrice(listing.price, stats.overall);
  }
  return null;
}

async function tagListings(listings) {
  await getStats();
  return Promise.all(
    (listings || []).map(async (l) => ({
      id: String(l._id),
      tier: await tagListing(l),
    }))
  ).then((arr) => Object.fromEntries(arr.map((e) => [e.id, e.tier])));
}

module.exports = { getStats, tagListing, tagListings, comparePrice };
