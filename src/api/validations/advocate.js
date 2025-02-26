//Variables
const advocateValidation = {};

//Models
const Advocate = require("../models/advocate");
const Blog = require("../models/blogs");

//Helpers
const hash = require("../helpers/hash");

advocateValidation.checkExistingAdvocate = async (email, enrollmentNumber) => {
  const existingAdvocate = await Advocate.findOne({
    $or: [
      { "contactDetails.email": email },
      { "workDetails.enrollmentNumber": enrollmentNumber },
    ],
  });
  return existingAdvocate;
};

advocateValidation.checkExistingAdvocateByEmail = async (email) => {
  const existingAdvocate = await Advocate.findOne({
    $or: [{ "contactDetails.email": email }],
  });
  return existingAdvocate;
};

advocateValidation.checkUserNameAvaiability = async (userName) => {
  const existingUserName = await Advocate.findOne({
    "personalDetails.userName": userName,
  });

  if (existingUserName != null) {
    return true;
  }

  return false;
};

advocateValidation.checkExistingPhoneNumber = async (phone) => {
  const existingPhoneNumber = await Advocate.findOne({
    "contactDetails.phone": phone,
  });

  if (existingPhoneNumber != null) {
    return true;
  }

  return false;
};

advocateValidation.checkEmailIsVerified = async (email) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
    // "workDetails.enrollmentNumber": enrollmentNumber,
  });
  if (!existingAdvocate) {
    return false;
  }
  const isVerified = existingAdvocate.verificationDetails.isEmailVerified;

  return isVerified;
};

advocateValidation.checkAdvocateIsVerified = async (email) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
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
  const { email, password } = advocate;
  const existingAdvocate = await Advocate.find({
    "contactDetails.email": email,
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
