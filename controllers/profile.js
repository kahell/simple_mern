// Load Validation
const validateProfileInput = require("../validations/profile");
const validateExperienceInput = require("../validations/experience");
const validateEducationInput = require("../validations/education");

// Load Profile Model
const Profile = require("../models/Profile");
// Load User Model
const User = require("../models/User");

// ** PROFILE
exports.profile_getSelf = (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json({ errors });
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
};

exports.profile_get_all = (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: "There are no profile" }));
};

exports.profile_by_handle = (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
};

exports.profile_by_user = (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
};

exports.create_or_update_profile = (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;
  // Skills - Split into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }
  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      )
        .then(profile => res.json(profile))
        .catch(err => res.status(404).json(err));
    } else {
      // Create

      // Check if handle exists
      Profile.findOne({ handle: profileFields.handle })
        .then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields)
            .save()
            .then(profile => res.json(profile))
            .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
    }
  });
};

exports.delete_profile = (req, res) => {
  Profile.findOneAndDelete({ user: req.user.id })
    .then(() => {
      User.findOneAndDelete({ _id: req.user.id })
        .then(() => res.json({ success: true }))
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json(err));
};

// ** Experience
exports.add_experience = (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id }).then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    // Add to exp array
    profile.experience.unshift(newExp);

    profile.save().then(profile => res.json(profile));
  });
};

exports.update_experience = (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get field
  const experience = {};
  experience.title = req.body.title;
  experience.company = req.body.company;
  experience.from = req.body.from;
  experience.to = req.body.to;
  experience.description = req.body.description;

  Profile.find({ user: req.user.id })
    .then(profile => {
      // Check Error
      if (profile[0].experience.length <= 0) {
        return res.status(401).json({ error: "Experience not found" });
      }

      // Get remove index
      const updateIndex = profile[0].experience
        .map(item => item.id)
        .indexOf(req.params.id);

      // Update of array
      for (key in experience) {
        if (!experience[key]) {
          experience[key] = profile[0].experience[updateIndex][key];
        }
      }

      // Update
      Profile.updateOne(
        { user: req.user.id, "experience._id": req.params.id },
        {
          $set: {
            "experience.$.title": experience.title,
            "experience.$.company": experience.company,
            "experience.$.from": experience.from,
            "experience.$.to": experience.to,
            "experience.$.description": experience.description
          }
        },
        { new: true }
      )
        .then(profile => {
          if (!profile.ok) {
            return res
              .status(404)
              .json({ error: true, message: "Update failed." });
          }

          Profile.find({ user: req.user.id })
            .then(profile => res.json(profile))
            .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json({ error: err }));
};

exports.delete_experience = (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
};

// *** Education
exports.add_education = (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    // Add to exp array
    profile.education.unshift(newEdu);

    profile.save().then(profile => res.json(profile));
  });
};

exports.delete_education = (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // Splice out of array
      profile.education.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
};
