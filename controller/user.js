const User = require("../models/user");
const passport = require("passport");


module.exports.signupForm = async(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signUp = async(req,res)=>{
   try{
    let {username,email,password} = req.body;
    const newUser = await new User({
        email,
        username,
    });
   const registeredUser = await User.register(newUser,password);
   req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    } 
    req.flash("success","Welcome To Wenderlust!");   
    res.redirect("/listings");
   })

   } catch(e){
       req.flash("error",e.message);
       res.redirect("/signup");
   }
};

module.exports.loginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.Login = async(req,res)=>{
    req.flash("success","Welcome back to Wonderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.Logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You LoggedOut successfully");
        res.redirect("/listings");
    })
};