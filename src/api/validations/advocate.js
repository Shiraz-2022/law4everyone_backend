//Variables
const advocateValidation = {};

//Models
const Advocate = require("../models/advocate");

//Helpers
const hash = require("../helpers/hash");

advocateValidation.checkExistingAdvocate = async (email, enrollmentNumber) => {
  const existingAdvocate = await Advocate.findOne({
    "contactDetails.email": email,
    "workDetails.enrollmentNumber": enrollmentNumber,
  });
  return existingAdvocate;
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

module.exports = advocateValidation;
