const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schemaValidation");
const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};


module.exports.createReview = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await  newReview.save();
    await listing.save();
    req.flash("success" ,"New Review Created!");
    res.redirect(`/listings/${id}/show`);
};

module.exports.deleteReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate( id, {$pull :{reviews :reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" ,"Review Deleted!");
    res.redirect(`/listings/${id}/show`);
};