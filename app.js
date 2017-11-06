var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    Campground            = require("./models/campground"),
    passport              = require("passport"),
    flash                 = require("connect-flash"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Comment               = require("./models/comment");

// Requiring routes files
var campgroundRoutes = require("./routes/campgrounds"),
    commentsRoutes   = require("./routes/comments"),
    indexRoutes      = require("./routes/index");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/yelpdb", {useMongoClient: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "Dudu is awesome",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.locals.moment = require('moment');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");    
    next();
});

// Adding routes functionality
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

app.listen(3000, function() {
    console.log("YelpCamp Server is up");
})