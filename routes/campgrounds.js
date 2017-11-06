var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// GET Campgrounds
router.get("/", function(req, res) {
    Campground.find({}, function(err, campgrounds) {
        if(err) {
            res.send("Error: could not retrieve data from the database");
        } else {
            res.render("campgrounds/index", {campgrounds: campgrounds, page: "campgrounds"});        
        }
    });
});

// GET New Campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// GET Show campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        res.render("campgrounds/show", {campground: foundCampground});        
    });
});

// POST Campgrounds
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.desc;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {name: name, image: image, desc: desc, price: price, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds/" + newlyCreated._id);
            }
        });
      });
});

// Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: campground});            
        }
    });
});

// Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = req.body.campground;

        newCampground.location = location;
        newCampground.lat = lat;
        newCampground.lng = lng;

        Campground.findByIdAndUpdate(req.params.id, {$set: newCampground}, function(err, campground) {
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
      });
});

// Destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            req.flash("error", "An error occured. Please try again later");            
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Successfully removed campground");            
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;