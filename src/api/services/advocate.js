//Models
const Advocate = require("../models/advocate");
const Blog = require("../models/blogs");
const Problem = require("../models/problem");

//Helpers
const geoCode = require("../helpers/geoCode");

//Variables
const advocateService = {};

//Datas
const predefinedTags = require("../../datas/tags.js");

advocateService.createAdvocate = async (advocateData) => {
  const newAdvocate = new Advocate(advocateData);
  await newAdvocate.save();
  return newAdvocate;
};

advocateService.updateVerficationStatus = async (token) => {
  const updatedUser = await Advocate.findOneAndUpdate(
    { "verificationDetails.verificationToken": token },
    {
      "verificationDetails.verificationToken": null,
      "verificationDetails.isEmailVerified": true,
    },
    { new: true }
  );

  return updatedUser;
};

advocateService.updateAdvcoateVerificationStatus = async (
  email,
  enrollmentNumber
) => {
  const updatedUser = await Advocate.findOneAndUpdate(
    {
      "contactDetails.email": email,
      "workDetails.enrollmentNumber": enrollmentNumber,
    },
    {
      "verificationDetails.isAdvocateVerified": true,
    }
    // { new: true }
  );

  return updatedUser;
};

advocateService.createBlog = async (blogData) => {
  const newBlog = new Blog(blogData);
  await newBlog.save();
  return newBlog;
};

advocateService.editBlog = async (advocateId, blogId, blogData) => {
  const {
    title,
    description,
    comments,
    likes,
    liked,
    userId,
    newTagsProbability,
  } = blogData;

  const updateFields = {
    $set: {
      title: title,
      description: description,
      newTagsProbability: newTagsProbability,
    },
  };

  if (comments) {
    updateFields.$push = { comments: comments };
  }

  if (likes && liked === false) {
    updateFields.$push = { likes: likes };
  }

  if (liked === true) {
    updateFields.$pull = { likes: { likedBy: userId } };
  }

  const updatedBlog = await Blog.findOneAndUpdate(
    {
      advocateId: advocateId,
      blogId: blogId,
    },
    updateFields,
    { new: true }
  );

  return updatedBlog;
};

advocateService.deleteAccount = async (advocateId) => {
  await Blog.deleteMany({ advocateId: advocateId });

  await Advocate.deleteOne({ advocateId: advocateId });
};

advocateService.getProfileDetails = async (advocateId) => {
  return await Advocate.findOne({ advocateId: advocateId });
};

advocateService.getProblems = async (skip, limit) => {
  const problems = await Problem.find({ status: "open" })
    .skip(skip)
    .limit(limit)
    .populate({ path: "user", select: "userId userName name profileImage" });

  problems.sort((a, b) => a.timestamp - b.timestamp);

  return problems;
};

advocateService.storeSocketId = async (advocateId, socketId) => {
  const updatedUser = await Advocate.findOneAndUpdate(
    { advocateId: advocateId },
    { socketId: socketId },
    { new: true }
  );

  return updatedUser;
};

advocateService.geoCodeAddress = async (address) => {
  const geoCodedAddress = await geoCode(address);

  return geoCodedAddress;
};

advocateService.changeWorkStatus = async (advocateId) => {
  const advocate = await Advocate.findOne({ advocateId: advocateId });

  await Advocate.findOneAndUpdate(
    { advocateId: advocateId },
    { workStatus: !advocate.workStatus }
  );

  return !advocate.workStatus;
};

advocateService.updateBlogTagsProbabilty = async (tags) => {
  const tagsProbability = new Array(20).fill(0);

  console.log(tags);

  await tags.forEach((tag) => {
    const lowerCaseTag = tag.toLowerCase();
    const index = predefinedTags.indexOf(lowerCaseTag);
    if (index !== -1) {
      tagsProbability[index]++;
    }
  });

  return tagsProbability;
};

advocateService.getProblemDetails = async (problemId) => {
  const problem = await Problem.findOne({ problemId: problemId });
  return problem;
};

advocateService.updateNoOfProblemRequests = async (noOfRequests, problemId) => {
  await Problem.findOneAndUpdate(
    { problemId: problemId },
    { noOfRequests: noOfRequests + 1 },
    { new: true }
  );
};

advocateService.updateProblemsRequested = async (
  problemId,
  userId,
  advocateId
) => {
  const problemRequested = {
    userId: userId,
    problemId: problemId,
    status: "pending",
  };
  await Advocate.findOneAndUpdate(
    { advocateId: advocateId },
    { $push: { problemsRequested: problemRequested } },
    { new: true }
  );
};

advocateService.getRequestedProblems = async (advocateId) => {
  const advocate = await Advocate.findOne({
    advocateId: advocateId,
  }).populate([
    {
      path: "problemRequestedUserDetails",
      select: "userName name profileImage",
    },
    {
      path: "problemRequestedProblemDetails",
      select: "title description",
    },
  ]);

  return advocate;
};

module.exports = advocateService;
