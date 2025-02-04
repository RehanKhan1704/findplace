const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const {listingSchema,reviewSchema} = require("../schemaValidation");
const Review = require("../models/review");
const fetch = require("node-fetch");


module.exports.validatelisting = (req,res,next)=>{
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        console.log(error);
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};

module.exports.index = async (req,res)=>{
    let listData =await Listing.find();
    res.render("listings/index.ejs",{listData})
};

module.exports.filter = async (req,res)=>{
    let {q} = req.query;
    if(!q){
        return res.redirect("/listings");
    }
    const listData = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $in :[q]}}
        ],    });
    if(listData.length<1){
        req.flash("error", "Listing you requested is not exist");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs",{listData})
}
  
module.exports.show = async (req,res)=>{
    let {id} = req.params;
    let list =await Listing.findById(id)
    .populate({
        path :"reviews" ,
        populate : {
            path : "author",
        },
    })
    .populate("owner");
    if(!list){
       req.flash("error", "Listing you requested is not exist");
       res.redirect("/listings");
    }

    res.render("listings/show.ejs",{list});
};

module.exports.renderNewListingForm = (req,res)=>{
    res.render("listings/CreateNewList.ejs");
};

module.exports.createNewListing = async(req,res)=>{
    console.log(req.body.listing.location)
     // Geocode location
     const apiKey = process.env.OPENCAGE_API_KEY;
     const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(req.body.listing.location)},${encodeURIComponent(req.body.listing.country)}&key=${apiKey}`;
     
     const response = await fetch(geocodeUrl);
     const data = await response.json();
     
     if (data.results.length === 0) {
         req.flash("error", "Could not find location. Please try again.");
         return res.redirect("/listings/new");
     }
 
     const { lat, lng } = data.results[0].geometry;

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.latitude = lat;
    newListing.longitude = lng;
    await newListing.save();
    req.flash("success" ,"New Listing Created!");
    res.redirect(`/listings`);
}

module.exports.editLiting = async (req,res)=>{
    let {id} = req.params;
    let list =await Listing.findById(id);
    if(!list){
        req.flash("error", "Listing you requested is not exist");
        res.redirect("/listings");
     }
    res.render("listings/edit",{list});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let updatedUser = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedUser.image = {url,filename};
        await updatedUser.save();
    }
    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}/show`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    await Review.deleteMany({_id :{$in : deletedListing.reviews}});
    req.flash("success","listing deleted");
    res.redirect("/listings");
};