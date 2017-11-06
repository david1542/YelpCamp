var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// GET New comment form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});    
        }
    });
});

// POST Submit new comment
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            req.flash("error", "Could not find campground. Please try again later");                        
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "An error occured. Please try again later");  
                    res.redirect("/campgrounds/" + campground._id);                    
                } else {
                    // Add username and id to comment and save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // Add the comment to the associated campground 
                    campground.comments.push(comment);
                    campground.save(function(err, data) {
                        req.flash("success", "Successfully added a comment!");                                    
                        res.redirect("/campgrounds/" + campground._id);
                    });
                }
            });
        }
    });
});

//
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id : req.params.id, comment: comment});
        }
    })
});

// Comment update route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if(err) {
            req.flash("error", "An error occured. Please try again later");                                   
            res.redirect("back");
        } else {
            req.flash("success", "Successfully updated comment!");                                    
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// Comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            req.flash("error", "An error occured. Please try again later");                                    
            res.redirect("back")
        } else {
            req.flash("success", "Successfully deleted comment");                                                
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;