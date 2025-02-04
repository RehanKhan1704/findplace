require('dotenv').config();

const fetch = require("node-fetch"); // Ensure you have this package installed

const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing");

const db_url = process.env.ATLASDB_URL;



main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})


async function main(){
    mongoose.connect(db_url);
};

const initDB = async function () { 
    const apiKey = process.env.OPENCAGE_API_KEY;

    // Clear existing listings
    await Listing.deleteMany({});
    console.log("Existing listings deleted.");

    // Update the data with owner and category
    initdata.data = initdata.data.map(obj => ({
        ...obj,
        owner: "67a1a5eaa2163d89888a567b",
        category: ["Rooms", "Beach", "Arctic"],
    }));

    // Process each listing to fetch latitude and longitude
    for (const obj of initdata.data) {
        const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(obj.location)},${encodeURIComponent(obj.country)}&key=bcb627001a36474da0b953cb62003fed`

        try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();

            console.log(`Geocode URL for ${obj.location}, ${obj.country}:`, geocodeUrl);

            if (data.status.code === 200 && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;
                obj.latitude = lat;
                obj.longitude = lng;
                console.log(`Coordinates found for ${obj.location}, ${obj.country}: (${lat}, ${lng})`);
            } else {
                console.warn(`Could not find coordinates for location: ${obj.location}, ${obj.country}`);
                obj.latitude = 0;
                obj.longitude = 0;
            }
        } catch (error) {
            console.error(`Error fetching coordinates for ${obj.location}, ${obj.country}:`, error);
            obj.latitude = 0;
            obj.longitude = 0;
        }
    }

    // Insert the updated data into the database
    await Listing.insertMany(initdata.data);
    console.log("Database initialized with updated listings.");
};


initDB();

