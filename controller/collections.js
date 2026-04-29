const Collection = require("../models/collection.js");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be signed in to view collections.");
    return res.redirect("/login");
  }
  const collections = await Collection.find({ owner: req.user._id })
    .populate({ path: "listings", select: "title image price location" })
    .sort({ updatedAt: -1 });
  res.render("collections/index.ejs", { collections });
};

module.exports.renderNew = (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be signed in to create a collection.");
    return res.redirect("/login");
  }
  res.render("collections/new.ejs", { palette: Collection.PALETTE });
};

module.exports.create = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { name, description, coverColor } = req.body.collection || {};
  const c = await Collection.create({
    owner: req.user._id,
    name: (name || "Untitled").trim(),
    description: (description || "").trim(),
    coverColor: Collection.PALETTE.includes(coverColor)
      ? coverColor
      : Collection.PALETTE[0],
  });
  req.flash("success", `Collection "${c.name}" created`);
  res.redirect(`/collections/${c._id}`);
};

module.exports.show = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const c = await Collection.findOne({
    _id: req.params.id,
    owner: req.user._id,
  }).populate({
    path: "listings",
    select: "title image price location country",
  });
  if (!c) {
    req.flash("error", "Collection not found");
    return res.redirect("/collections");
  }
  res.render("collections/show.ejs", { collection: c });
};

module.exports.update = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { name, description, coverColor } = req.body.collection || {};
  const update = {};
  if (name) update.name = name.trim();
  if (description !== undefined) update.description = description.trim();
  if (Collection.PALETTE.includes(coverColor)) update.coverColor = coverColor;
  await Collection.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    update
  );
  req.flash("success", "Collection updated");
  res.redirect(`/collections/${req.params.id}`);
};

module.exports.destroy = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  await Collection.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  req.flash("success", "Collection deleted");
  res.redirect("/collections");
};

module.exports.addListing = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "auth required" });
  const { listingId } = req.body;
  const listing = await Listing.findById(listingId).select("_id");
  if (!listing) return res.status(404).json({ error: "listing not found" });
  await Collection.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $addToSet: { listings: listing._id } }
  );
  res.json({ ok: true });
};

module.exports.removeListing = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  await Collection.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $pull: { listings: req.params.listingId } }
  );
  res.redirect(`/collections/${req.params.id}`);
};

module.exports.toggleShare = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const c = await Collection.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!c) return res.redirect("/collections");
  c.isPublic = !c.isPublic;
  await c.save();
  req.flash(
    "success",
    c.isPublic ? "Collection is now public" : "Collection is private again"
  );
  res.redirect(`/collections/${c._id}`);
};

module.exports.publicView = async (req, res) => {
  const c = await Collection.findOne({
    shareToken: req.params.token,
    isPublic: true,
  })
    .populate({
      path: "listings",
      select: "title image price location country",
    })
    .populate({ path: "owner", select: "username" });
  if (!c) {
    req.flash("error", "Collection not found or no longer public");
    return res.redirect("/listings");
  }
  res.render("collections/public.ejs", { collection: c });
};

module.exports.listMine = async (req, res) => {
  if (!req.user) return res.json({ collections: [] });
  const collections = await Collection.find({ owner: req.user._id })
    .select("name coverColor listings")
    .sort({ updatedAt: -1 })
    .lean();
  res.json({
    collections: collections.map((c) => ({
      id: String(c._id),
      name: c.name,
      coverColor: c.coverColor,
      count: (c.listings || []).length,
    })),
  });
};
