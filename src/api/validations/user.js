//Helpers
const hash = require("../helpers/hash.js");

//models
const User = require("../models/user.js");
const Blog = require("../models/blogs.js");

//Variables
const userValidation = {};

userValidation.checkExistingUser = async (email) => {
  const existingUser = await User.findOne({ email });
  return existingUser;
};

userValidation.checkVerificationToken = async (res, verificationToken) => {
  const existingUser = await User.findOne({ verificationToken });
  return existingUser;
};

userValidation.checkUserPassword = async (user) => {
  const { email, password } = user;
  const existingUser = await User.find({ email: email });
  const isPasswordVerified = await hash.comparePassword(
    password,
    existingUser[0].password
  );

  return isPasswordVerified;
};

userValidation.checkEmailIsVerified = async (email) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return false;
  }
  const isVerified = existingUser.isVerified;

  return isVerified;
};

userValidation.checkExistingBlog = async (blogId) => {
  const blog = await Blog.findOne({ blogId: blogId });

  return blog;
};

userValidation.checkIfBlogIsLiked = async (blogId, userId) => {
  const like = await Blog.findOne({
    blogId: blogId,
    "likes.likedBy": userId,
  });

  return like ? true : false;
};

module.exports = userValidation;
