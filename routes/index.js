var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// GET Landing Page
router.get("/", function(req, res) {
    res.render("landing");
});

// Register routes
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'}); 
});

router.post("/register", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.register(new User({username: username}), password, function(err, user) {
        if(err) {
            return res.render("register", {error: err.message});
        }

        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome, " + user.username + "! You are now signed in");
            res.redirect("/campgrounds");
        });
    });
});

// Sign in routes
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'}); 
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    successFlash: "You are now logged in!"
}),  function(req, res) {

});

// Logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged you out.");
    res.redirect("/campgrounds");
});

module.exports = router;