//Models
const User = require("../models/user.js");
const Problem = require("../models/problem.js");

//Variables
const userService = {};

userService.createUser = async (userData) => {
  const newUser = new User(userData);
  await newUser.save();
  return newUser;
};

userService.updateVerficationStatus = async (res, token) => {
  const updatedUser = await User.findOneAndUpdate(
    { verificationToken: token },
    { verificationToken: null, isVerified: true },
    { new: true }
  );

  return updatedUser;
};

userService.createProblem = async (problemData) => {
  const newProblem = new Problem(problemData);
  await newProblem.save();
  return newProblem;
};

module.exports = userService;
