const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsyn.js");
const ctl = require("../controller/host.js");

router.get("/dashboard", wrapAsync(ctl.dashboard));

module.exports = router;
