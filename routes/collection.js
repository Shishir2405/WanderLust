const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsyn.js");
const ctl = require("../controller/collections.js");

router.get("/", wrapAsync(ctl.index));
router.get("/new", ctl.renderNew);
router.post("/", wrapAsync(ctl.create));

router.get("/mine.json", wrapAsync(ctl.listMine));

router.get("/:id", wrapAsync(ctl.show));
router.put("/:id", wrapAsync(ctl.update));
router.delete("/:id", wrapAsync(ctl.destroy));

router.post("/:id/listings", express.json(), wrapAsync(ctl.addListing));
router.post("/:id/listings/:listingId/remove", wrapAsync(ctl.removeListing));
router.post("/:id/share/toggle", wrapAsync(ctl.toggleShare));

module.exports = router;
