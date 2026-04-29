/**
 * * Booking Model Schema
 * ? Defines the Mongoose schema for guest reservations on listings.
 * ? Each booking represents a date range [startDate, endDate)
 * ? where startDate is inclusive and endDate is the checkout day (exclusive).
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
    index: true,
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    default: 1,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * * Compound index for fast overlap queries.
 */
bookingSchema.index({ listing: 1, startDate: 1, endDate: 1 });

/**
 * * Static helper: find any active booking that overlaps the given range.
 * ? Two ranges [a,b) and [c,d) overlap iff a < d AND b > c.
 */
bookingSchema.statics.findOverlapping = function (listingId, start, end) {
  return this.findOne({
    listing: listingId,
    status: "confirmed",
    startDate: { $lt: end },
    endDate: { $gt: start },
  });
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
