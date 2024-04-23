//Models
const User = require("../models/user.js");
const Problem = require("../models/problem.js");
const Blog = require("../models/blogs.js");
const Advocate = require("../models/advocate.js");

//Variables
const userService = {};

//Validation
const userValidation = require("../validations/user.js");

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
  const blogs = await Blog.find({})
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: "advocates",
        select: "personalDetails.userName personalDetails.profileImage",
      },
      {
        path: "commentedByDetails",
        select: "name",
      },
    ]);

  blogs.sort((a, b) => a.timeStamp - b.timeStamp);

  return blogs;
};

//advocates

userService.searchAdvocate = async (userName, skip, limit) => {
  const regexPattern = new RegExp(`^${userName}`, "i");
  const advocate = await Advocate.find({
    "personalDetails.userName": { $regex: regexPattern },
  })
    .skip(skip)
    .limit(limit);

  return advocate;
};

userService.storeSocketId = async (userId, socketId) => {
  const updatedUser = await User.findOneAndUpdate(
    { userId: userId },
    { socketId: socketId },
    { new: true }
  );

  return updatedUser;
};

userService.getUserDetails = async (userId) => {
  const existingUser = await User.findOne({ userId: userId });

  return existingUser;
};

userService.storeNotification = async (userId, notification) => {
  const updatedUser = await User.findOneAndUpdate(
    { userId: userId },
    { $push: { notifications: notification } },
    { new: true }
  );

  return updatedUser;
};

userService.updateBlogLikedStatus = async (blogs, userId) => {
  const updatedBlogs = [];

  await Promise.all(
    blogs.map(async (blog) => {
      const isLiked = await userValidation.checkIfBlogIsLiked(
        blog.blogId,
        userId
      );
      // console.log(isLiked);

      const updatedBlog = await Blog.findOneAndUpdate(
        { blogId: blog.blogId },
        { isLiked: isLiked },
        { new: true }
      ).populate([
        {
          path: "advocates",
          select: "personalDetails.userName personalDetails.profileImage",
        },
        {
          path: "commentedByDetails",
          select: "name",
        },
      ]);

      updatedBlogs.push(updatedBlog);
    })
  );

  return updatedBlogs;
};

// userService.getAdvocate = async (advocateId) => {
//   const advocate = await Advocate.find({
//     id: { advocateId },
//   });

//   return advocate;
// };

module.exports = userService;
