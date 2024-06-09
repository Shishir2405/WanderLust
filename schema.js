/**
 * * Defines a Joi schema for validating listing objects, ensuring required properties and data types.
 * ! Properties like title, description, location, country, and price are required with specific constraints.
 * ? Allows empty or null image property while validating other properties rigorously.
 * */

const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    category: Joi.string().required(),
    typeOfPlace: Joi.string().required(),
    bedrooms: Joi.number().required().max(8),
    beds: Joi.number().required().max(8),
    locked: Joi.string().required(),
    other: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
