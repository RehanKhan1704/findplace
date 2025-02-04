require('dotenv').config();

//importing packages
const express = require("express");
const app = express();
const path = require("path");
const Listing = require("./models/listing");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const db_url = process.env.ATLASDB_URL;

//connecting datase
main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    mongoose.connect(db_url);
}


//layout setup
app.use(expressLayouts);
app.set('layout', 'layout/boilerplate');

//ejs setup
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.set("listings",path.join(__dirname,"/views/listings"));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

//session store
const store = MongoStore.create(
    {
        mongoUrl:db_url,
        crypto:{
            secret:process.env.SECRET,
        },
        touchAfter:24 * 3600 ,
    }
)

store.on("error",()=>{
    console.log("ERROR in mongoDB session ",err)
})

//express session setup 
const sessionOptions = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
   res.locals.success   = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.newUser = req.user;
   next();
})

//RESTful API's

// app.get("/demoUser",async (req,res)=>{
//     let newUser = new User({
//         email : "abc@gmail.com",
//         username : "abc-89-bc",
//     });

//     const registeredUser = await User.register(newUser,"helloworld");
//     res.send(registeredUser);
// })

app.get("/",async(req,res)=>{
    let listData =await Listing.find();
    res.render("listings/index.ejs",{listData});
})


//Routes for Listings
app.use("/listings",listingsRouter);

//Routes for Reviews 
app.use("/listings/:id/reviews",reviewsRouter);

//Routes for Users
app.use("/",userRouter);

app.all("*",wrapAsync(async(req,res,next)=>{
    next(new ExpressError(502,"page not found"));
}));
app.use((err,req,res,next)=>{
    const {statusCode=400,message="something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
})

app.listen(3000,()=>{
    console.log("listening");
})