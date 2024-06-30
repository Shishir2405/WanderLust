/**
 * * User Model Schema
 * ? This module defines the Mongoose schema for users, including fields for email, favorite listings, and favorite listings with dates.
 * ? It also includes a pre-save middleware to update favorite listings dates and integrates passport-local-mongoose for authentication handling.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  favoriteListings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  favoriteListingsDates: [
    {
      listingId: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
      dateAdded: {
        type: Date,
        default: Date.now,
      },
      monthAdded: {
        type: String,
      },
    },
  ],
});

/**
 * * Pre-save Middleware
 * ? Updates favorite listings dates when favoriteListings is modified.
 */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("favoriteListings")) {
    const dateAdded = new Date();
    const monthAdded = dateAdded.toLocaleString("default", { month: "long" });
    user.favoriteListings.forEach((listingId) => {
      user.favoriteListingsDates.push({ listingId, dateAdded, monthAdded });
    });
  }
  next();
});

// Plugin passportLocalMongoose for handling authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
