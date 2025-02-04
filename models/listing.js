const mongoose = require("mongoose");
const Review = require("./review");
const { array, string } = require("joi");
// const User = require("./user");

const listingSchema = new mongoose.Schema({
    title :{
        type : String,
        require:true,
    },
    description : {
        type : String,
    },
    image : {
        url : String,
        filename : String,
    },
    price : {
        type : Number,
    },
    location : {
        type : String,
    },
    country : {
        type : String,
    },
    latitude:{
        type: Number,
    },
    longitude : {
        type :Number
    },
    reviews :[
        {
           type : mongoose.Schema.Types.ObjectId,
           ref : "Review" ,
        },
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    category:{
        type:[String],
        enum: ["Trending", "Beach", "Rooms", "Cities", "Mountains","Castels","Pools","Arctic","Farms","Camping"], // Predefined values
        default: ["Trending"], // Set default value
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
     if(listing){
        await Review.deleteMany({_id :{$in : listing.reviews}});
     }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;