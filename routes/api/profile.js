const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./assets/upload/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// Load Controller
const profileControllers = require("../../controllers/profile");

// @route   GET api/profile
// @desc    Get current users profiles
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileControllers.profile_getSelf
);

// @route   Get api/profile/all
// @desc    Get all profile
// @access  Public
router.get("/all", profileControllers.profile_get_all);

// @route   Get api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", profileControllers.profile_by_handle);

// @route   Get api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", profileControllers.profile_by_user);

// @route   POST api/profile
// @desc    Create or Edit user profiles
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileControllers.create_or_update_profile
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileControllers.delete_profile
);

// @route   POST api/profile/experience
// @desc    Add experience to profiles
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  profileControllers.add_experience
);

// @route   POST api/profile/experience/:id
// @desc    Update experience to profiles
// @access  Private
router.post(
  "/experience/:id",
  passport.authenticate("jwt", { session: false }),
  profileControllers.update_experience
);

// @route   DELETE api/profile/experience/:id
// @desc    Delete experience to profiles
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  profileControllers.delete_experience
);

// @route   POST api/profile/education
// @desc    Add education to profiles
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  profileControllers.add_education
);

// @route   DELETE api/profile/education/:id
// @desc    Delete education to profiles
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  profileControllers.delete_education
);

module.exports = router;
