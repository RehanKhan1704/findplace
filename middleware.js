const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next)=>{
      if(!req.isAuthenticated()){
           req.session.redirectUrl = req.originalUrl;
           req.flash("error","You must be logged in first");
           return res.redirect("/login")
      } 
      next(); 
}

module.exports.saveRedirectUrl = (req,res,next)=>{
      if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
      }
      next();
}

module.exports.isOwner = async(req,res,next)=>{
     let {id} = req.params;
     let listing = await Listing.findById(id);
     if(!res.locals.newUser._id.equals(listing.owner._id)){
       req.flash("error","You are not the owner of this listing")
       return res.redirect(`/listings/${id}/show`)
     }
     next();
}

module.exports.isAuthor = async(req,res,next)=>{
     let {id,reviewId} = req.params;
     let review = await Review.findById(reviewId);
     if(!review.author._id.equals(res.locals.newUser._id)){
       req.flash("error","You are not the owner of this Review")
       return res.redirect(`/listings/${id}/show`)
     }
     next();
}