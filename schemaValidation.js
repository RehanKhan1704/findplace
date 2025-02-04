const Joi = require("joi");

const listingSchema = Joi.object({
    listing:Joi.object({
       title: Joi.string().required(),
       image: Joi.object({
        url : Joi.string(),
        filename : Joi.string(),
       }),
       description: Joi.string().required(),
       price: Joi.number().required().min(0),
       location: Joi.string().required(),
       country: Joi.string().required(),
       category: Joi.array()
            .items(Joi.string().valid("Trending", "Beach", "Rooms", "Cities", "Mountains","Castels","Pools","Arctic","Farms","Camping")) // Allowed values
            .min(1) // At least one category is required
        }).required(),
});

const reviewSchema = Joi.object({
    review :Joi.object({
         rating : Joi.number().required().min(1).max(5),
         comment : Joi.string().required(),
    }).required(),
});

module.exports = {listingSchema,reviewSchema};
