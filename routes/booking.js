/**
 * ! Routes for booking creation, listing trips, cancellation, and availability lookups.
 */

const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const wrapAsync = require("../utils/wrapAsyn.js");
const { isLoggedIn } = require("../middleware.js");

/**
 * * Helper: parse a YYYY-MM-DD date string as a UTC midnight Date.
 */
function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * * Helper: number of nights between two midnights.
 */
function nightsBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * * POST /listings/:id/bookings
 * ? Creates a new booking for the current user.
 */
router.post(
  "/listings/:id/bookings",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, guests } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
      req.flash("error", "Please select valid check-in and check-out dates");
      return res.redirect(`/listings/${id}`);
    }

    if (start >= end) {
      req.flash("error", "Check-out must be after check-in");
      return res.redirect(`/listings/${id}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      req.flash("error", "Check-in cannot be in the past");
      return res.redirect(`/listings/${id}`);
    }

    const overlap = await Booking.findOverlapping(id, start, end);
    if (overlap) {
      req.flash(
        "error",
        "Sorry, those dates overlap with an existing booking. Please pick another range."
      );
      return res.redirect(`/listings/${id}`);
    }

    const nights = nightsBetween(start, end);
    const guestsCount = Math.max(1, parseInt(guests, 10) || 1);
    const totalPrice = nights * (listing.price || 0);

    await Booking.create({
      listing: listing._id,
      guest: req.user._id,
      startDate: start,
      endDate: end,
      guests: guestsCount,
      totalPrice,
      status: "confirmed",
    });

    req.flash(
      "success",
      `Booking confirmed for ${nights} night${nights === 1 ? "" : "s"}!`
    );
    res.redirect("/me/trips");
  })
);

/**
 * * GET /me/trips
 * ? Lists the current user's bookings as guest.
 */
router.get(
  "/me/trips",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const trips = await Booking.find({ guest: req.user._id })
      .populate("listing")
      .sort({ startDate: -1 });
    res.render("bookings/trips.ejs", { trips });
  })
);

/**
 * * POST /bookings/:id/cancel
 * ? Cancels a booking owned by the current user.
 */
router.post(
  "/bookings/:id/cancel",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/me/trips");
    }
    if (!booking.guest.equals(req.user._id)) {
      req.flash("error", "You can only cancel your own bookings");
      return res.redirect("/me/trips");
    }
    if (booking.status !== "confirmed") {
      req.flash("error", "Booking is already cancelled");
      return res.redirect("/me/trips");
    }
    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled");
    res.redirect("/me/trips");
  })
);

/**
 * * GET /listings/:id/bookings/availability.json
 * ? Returns booked ranges for a listing as JSON.
 */
router.get(
  "/listings/:id/bookings/availability.json",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { from, to } = req.query;

    const filter = { listing: id, status: "confirmed" };
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (fromDate && toDate) {
      filter.startDate = { $lt: toDate };
      filter.endDate = { $gt: fromDate };
    }

    const bookings = await Booking.find(filter).select(
      "startDate endDate -_id"
    );
    const ranges = bookings.map((b) => ({
      start: b.startDate.toISOString().slice(0, 10),
      end: b.endDate.toISOString().slice(0, 10),
    }));
    res.json({ listing: id, ranges });
  })
);

module.exports = router;
