const express = require("express");
const router = express.Router({mergeParams:true});
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controller/user");

router.get("/signup",userController.signupForm);

router.post("/signup",userController.signUp);

router.get("/login",userController.loginForm)

router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect :"/login",failureFlash:true}),userController.Login);

router.get("/logout",userController.Logout);
module.exports = router;