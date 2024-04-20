//Models
const Advocate = require("../models/advocate");
const Blog = require("../models/blogs");
const Problem = require("../models/problem");

//Variables
const advocateService = {};

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
  const { title, description } = blogData;
  const updatedBlog = Blog.findOneAndUpdate(
    {
      advocateId: advocateId,
      blogId: blogId,
    },
    {
      title: title,
      description: description,
    },
    { new: true }
  );

  // console.log(updatedProblem);

  return updatedBlog;
};

advocateService.deleteAccount = async (advocateId) => {
  await Blog.deleteMany({ advocateId: advocateId });

  await Advocate.deleteOne({ advocateId: advocateId });
};

advocateService.getProfileDetails = async (advocateId) => {
  console.log(advocateId);
  return await Advocate.findOne({ advocateId: advocateId });
};

advocateService.getProblems = async (skip, limit) => {
  const problems = await Problem.find({}).skip(skip).limit(limit);

  problems.sort((a, b) => a.timestamp - b.timestamp);

  return problems;
};

module.exports = advocateService;
