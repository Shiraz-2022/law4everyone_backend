//Variables
const advocateValidation = {};

//Models
const Advocate = require("../models/advocate");
const Blog = require("../models/blogs");

//Helpers
const hash = require("../helpers/hash");

advocateValidation.checkExistingAdvocate = async (email, enrollmentNumber) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
    "workDetails.enrollmentNumber": enrollmentNumber,
  });
  return existingAdvocate;
};

advocateValidation.checkUserNameAvaiability = async (userName) => {
  const existingUserName = await Advocate.findOne({
    "personalDetails.userName": userName,
  });

  return existingUserName;
};

advocateValidation.checkEmailIsVerified = async (email, enrollmentNumber) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
    "workDetails.enrollmentNumber": enrollmentNumber,
  });
  if (!existingAdvocate) {
    return false;
  }
  const isVerified = existingAdvocate.verificationDetails.isEmailVerified;

  return isVerified;
};

advocateValidation.checkAdvocateIsVerified = async (
  email,
  enrollmentNumber
) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
    "workDetails.enrollmentNumber": enrollmentNumber,
  });
  if (!existingAdvocate) {
    return false;
  }
  const isVerified = existingAdvocate.verificationDetails.isAdvocateVerified;

  return isVerified;
};

advocateValidation.checkVerificationToken = async (res, verificationToken) => {
  const existingUser = await Advocate.findOne({
    "verificationDetails.verificationToken": verificationToken,
  });
  return existingUser;
};

advocateValidation.checkAdvocatePassword = async (advocate) => {
  const { email, password, enrollmentNumber } = advocate;
  const existingAdvocate = await Advocate.find({
    "contactDetails.email": email,
    "workDetails.enrollmentNumber": enrollmentNumber,
  });
  const isPasswordVerified = await hash.comparePassword(
    password,
    existingAdvocate[0].password
  );

  return isPasswordVerified;
};

advocateValidation.checkIfBlogIsLiked = async (blogId, advocateId) => {
  const like = await Blog.findOne({
    blogId: blogId,
    "likes.likedBy": advocateId,
  });

  return like ? true : false;
};

module.exports = advocateValidation;
