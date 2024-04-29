//Models
const User = require("../models/user.js");
const Problem = require("../models/problem.js");
const Blog = require("../models/blogs.js");
const Advocate = require("../models/advocate.js");

//Variables
const userService = {};
const { ObjectId } = require("mongodb");

//Validation
const userValidation = require("../validations/user.js");

//Helpers
const geoCode = require("../helpers/geoCode.js");
const tags = require("../../datas/tags.js");

//Datas
const predefinedTags = require("../../datas/tags.js");

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
        select: "name userName profileImage",
      },
    ]);

  blogs.sort((a, b) => a.timeStamp - b.timeStamp);

  return blogs;
};

//advocates

userService.searchAdvocateByUserName = async (userName, skip, limit) => {
  const regexPattern = new RegExp(`^${userName}`, "i");
  const advocate = await Advocate.find({
    "personalDetails.userName": { $regex: regexPattern },
  })
    .select(
      "personalDetails.name personalDetails.userName personalDetails.profileImage advocateId"
    )
    .skip(skip)
    .limit(limit);

  return advocate;
};

userService.searchAdvocateByName = async (name, skip, limit) => {
  const regexPattern = new RegExp(`^${name}`, "i");
  const advocate = await Advocate.find({
    "personalDetails.name": { $regex: regexPattern },
  })
    .select(
      "personalDetails.name personalDetails.userName personalDetails.profileImage advocateId"
    )
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

userService.nearbyAdvocates = async (location, limit, skip) => {
  const nearbyAdvocates = await Advocate.find({
    "verificationDetails.isEmailVerified": true,
    "verificationDetails.isAdvocateVerified": true,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [location[0], location[1]],
        },
        $maxDistance: 10000, // Specify the maximum distance in meters (e.g., 10 kilometers)
      },
    },
  })
    .select(
      "advocateId personalDetails.name personalDetails.userName personalDetails.profileImage"
    )
    .skip(skip)
    .limit(limit);

  return nearbyAdvocates;
};

userService.searchByLocation = async (address, limit, skip) => {
  const location = await geoCode(address);
  const nearbyAdvocates = await Advocate.find({
    "verificationDetails.isEmailVerified": true,
    "verificationDetails.isAdvocateVerified": true,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [location.lat, location.lng],
        },
        $maxDistance: 10000, // Specify the maximum distance in meters (e.g., 10 kilometers)
      },
    },
  })
    .select(
      "advocateId personalDetails.name personalDetails.userName personalDetails.profileImage"
    )
    .skip(skip)
    .limit(limit);

  return nearbyAdvocates;
};

userService.filterByAreasOfExpertise = async (areasOfExpertise, advocates) => {
  const filteredAdvocates = [];
  for (const advocate of advocates) {
    const existingAdvocate = await Advocate.findOne({
      advocateId: advocate.advocateId,
    }).select(
      "advocateId personalDetails.name personalDetails.userName personalDetails.profileImage workDetails.areasOfExpertise"
    );

    const isMatched = areasOfExpertise.some((area) =>
      existingAdvocate.workDetails.areasOfExpertise.some(
        (existingArea) => existingArea.toLowerCase() === area.toLowerCase()
      )
    );

    if (isMatched) {
      filteredAdvocates.push(existingAdvocate);
    }
  }

  filteredAdvocates.sort((a, b) => {
    const matchedAreasA = a.workDetails.areasOfExpertise.filter((area) =>
      areasOfExpertise.includes(area)
    ).length;
    const matchedAreasB = b.workDetails.areasOfExpertise.filter((area) =>
      areasOfExpertise.includes(area)
    ).length;
    return matchedAreasB - matchedAreasA;
  });

  return filteredAdvocates;
};

userService.updateUserTagsProbabilty = async (
  userId,
  tags,
  tagsProbability,
  incOrDec
) => {
  await tags.forEach((tag) => {
    const lowerCaseTag = tag.toLowerCase();
    const index = predefinedTags.indexOf(lowerCaseTag);
    if (index !== -1) {
      if (incOrDec) {
        tagsProbability[index]++;
      } else {
        tagsProbability[index]--;
      }
    }
  });

  await User.findOneAndUpdate(
    { userId: userId },
    { tagsProbability: tagsProbability }
  );

  return tagsProbability;
};

userService.removeFromUserNotifications = async (userId, notificationId) => {
  await User.findOneAndUpdate(
    { userId: userId },
    { $pull: { notifications: { _id: ObjectId(notificationId) } } },
    { new: true }
  );
};

module.exports = userService;
