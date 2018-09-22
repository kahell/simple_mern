const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load controllers
const userController = require("../../controllers/users");

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post("/register", userController.users_register);

// @route   GET api/users/login
// @desc    Login user / Returning JWT Token
// @access  Public
router.post("/login", userController.users_login);

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  userController.users_current
);
module.exports = router;
