const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Controller
const postsControllers = require("../../controllers/posts");

// @route   GET api/posts
// @desc    Get post
// @access  Public
router.get("/", postsControllers.posts_get_all);

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get("/:id", postsControllers.posts_get_by_id);

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postsControllers.posts_add
);

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  postsControllers.posts_delete
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  postsControllers.like_posts
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  postsControllers.unlike_posts
);

// @route   POST api/posts/comment/:id
// @desc    Add comment
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  postsControllers.comment_add
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  postsControllers.comment_delete
);

module.exports = router;
