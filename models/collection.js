const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const COVER_PALETTE = [
  "#fe424d",
  "#e82d72",
  "#1f9d55",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
];

function makeShareToken() {
  return crypto.randomBytes(8).toString("base64url");
}

const collectionSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 280 },
    coverColor: {
      type: String,
      enum: COVER_PALETTE,
      default: COVER_PALETTE[0],
    },
    listings: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: makeShareToken, unique: true, index: true },
  },
  { timestamps: true }
);

collectionSchema.statics.PALETTE = COVER_PALETTE;

module.exports = mongoose.model("Collection", collectionSchema);
