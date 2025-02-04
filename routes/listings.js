
const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema,reviewSchema} = require("../schemaValidation");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controller/listing");
const multer  = require('multer')
const {storage} = require("../CloudConfig");
const upload = multer({storage})


router.use(express.json());
router.use(express.urlencoded({extended:true}));

const validatelisting = (req,res,next)=>{
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
}

//show all list --> menu(home page)
router.get("/",wrapAsync(listingController.index));

//filter routes
router.get("/filter",wrapAsync(listingController.filter));

//show List in details 
router.get("/:id/show",wrapAsync(listingController.show));

//new route -->show form for creating new list
router.get("/new",isLoggedIn,listingController.renderNewListingForm)

//route for creating lists --post api
router.post("/",isLoggedIn,upload.single('listing[image]'),validatelisting,wrapAsync(listingController.createNewListing) )

//route for edit form
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editLiting));

//update route
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validatelisting,wrapAsync(listingController.updateListing));

//route to delete listings
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

module.exports = router;