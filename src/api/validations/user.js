//Helpers
const hash = require("../helpers/hash.js");
const HTTP_STATUS_CODES = require("../helpers/statusCodes.js");

//models
const User = require("../models/user.js");

//Variables
const userValidation = {};

userValidation.checkExistingUser = async (email) => {
  const existingUser = await User.findOne({ email });
  return existingUser;
};

userValidation.checkVerificationToken = async (res, verificationToken) => {
  try {
    const existingUser = await User.findOne({ verificationToken });
    return existingUser;
  } catch (error) {
    res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
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

module.exports = userValidation;
