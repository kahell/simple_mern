// Post model
const Post = require("../models/Post");
// Profile model
const Profile = require("../models/Profile");

// Validation
const validatePostInput = require("../validations/post");

exports.posts_get_all = (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found." }));
};

exports.posts_get_by_id = (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that id" })
    );
};

exports.posts_add = (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
};

exports.posts_delete = (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorize: "User not authorize." });
        }

        // Delete
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

exports.like_posts = (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already like this post" });
        }

        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

exports.unlike_posts = (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: "You have not yet liked this post" });
        }

        // Get the remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

exports.comment_add = (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id).then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };

    // Add to comments array
    post.comments.unshift(newComment);

    // Save
    post
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

exports.comment_delete = (req, res) => {
  Post.findById(req.params.id).then(post => {
    // Check to see if comment exists
    if (
      post.comments.filter(
        comment => comment._id.toString() === req.params.comment_id
      ).length === 0
    ) {
      return res
        .status(404)
        .json({ commentnotexists: "Comment does not exist" });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(item => item._id.toString())
      .indexOf(req.params.comment_id);

    // Splice comment out of array
    post.comments.splice(removeIndex, 1);

    // Save
    post.save().then(post => res.json(post));
  });
};
