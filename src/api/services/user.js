//Models
const User = require("../models/user.js");
const Problem = require("../models/problem.js");
const Blog = require("../models/blogs.js");
const Advocate = require("../models/advocate.js");
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

userService.editProblem = async (userId, problemId, problemData) => {
  const { title, description, status } = problemData;
  const updatedProblem = Problem.findOneAndUpdate(
    {
      userId: userId,
      problemId: problemId,
    },
    {
      title: title,
      description: description,
      status: status,
    }
  );

  // console.log(updatedProblem);

  return updatedProblem;
};

userService.getProblems = async (userId) => {
  const problemsBeforeSort = await Problem.find({ userId: userId });
  const problems = problemsBeforeSort.sort((a, b) => a.timeStamp - b.timeStamp);
  return problems;
};

userService.deleteProblem = async (problemId) => {
  await Problem.deleteOne({ problemId: problemId });
};

userService.getBlogs = async (skip, limit) => {
  const blogs = await Blog.find({}).skip(skip).limit(limit);

  return blogs;
};

userService.searchAdvocate = async (userName, skip, limit) => {
  const regexPattern = new RegExp(`^${userName}`, "i");
  const advocate = await Advocate.find({
    "personalDetails.userName": { $regex: regexPattern },
  })
    .skip(skip)
    .limit(limit);

  return advocate;
};

module.exports = userService;
