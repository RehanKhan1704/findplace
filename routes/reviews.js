const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAuthor } = require("../middleware");
const reviewController = require("../controller/review");
const {validateReview} = require("../controller/review");

router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));
// delete review routes
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;