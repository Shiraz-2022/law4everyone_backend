//Libs
const { v4: uuid } = require("uuid");
const fs = require("fs");

//Config
const { getIoInstance } = require("../../config/socketio");

//helpers
const sendMail = require("../helpers/nodemailer");
const JWT = require("../helpers/jwt");
const hash = require("../helpers/hash");
const { HTTP_STATUS_CODES } = require("../helpers/statusCodes");
const geoCode = require("../helpers/geoCode");

//Validations
const userValidation = require("../validations/user");

//Services
const userService = require("../services/user");
const advocateService = require("../services/advocate");
const advocate = require("../models/advocate");

//Variables
const userController = {};

//////////////// signup,signin ////////////////

userController.signup = async (req, res, next) => {
  try {
    const profileImagePath = req.file.path;

    const profileImage = fs.readFileSync(profileImagePath);

    const { name, email, password, phone, district, city, zipCode, state } =
      req.body;
    const existingUser = await userValidation.checkExistingUser(email);
    if (existingUser) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "User already exists. Please signin instead",
        isSignedUp: false,
      });
    }
    const verificationToken = Math.random().toString(36).substring(7);
    const hashedPassword = await hash.hashPassword(password);

    const combinedAdress =
      city + "," + district + "," + zipCode + "," + state + ",India";

    const location = await geoCode(combinedAdress);
    const coordinates = [];
    coordinates.push(location.lat);
    coordinates.push(location.lng);
    // console.log(location);

    const newUser = await userService.createUser({
      userId: uuid(),
      socketId: uuid(),
      name,
      email,
      password: hashedPassword,
      phone: phone,
      verificationToken,
      profileImage: profileImage,
      address: {
        district: district,
        city: city,
        zipCode: zipCode,
        state: state,
      },
      location: {
        coordinates: coordinates,
      },
    });

    fs.unlinkSync(profileImagePath);

    const verificationLink = `http://localhost:3000/user/verify?token=${verificationToken}`;

    await sendMail(email, verificationLink);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "User signed up, please verify your email",
      isSignedUp: true,
      user: { id: newUser.userId, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

userController.verifyUser = async (req, res, next) => {
  const { token } = req.query;

  try {
    const existingUser = userValidation.checkVerificationToken(res, token);

    if (!existingUser) {
      return res
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: "Invalid verification token" });
    }
    await userService.updateVerficationStatus(res, token);
    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: "Email verification successful" });
  } catch (error) {
    next(error);
  }
};

userController.signin = async (req, res, next) => {
  try {
    const user = req.body.user;
    const existingUser = await userValidation.checkExistingUser(user.email);

    if (!existingUser) {
      res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "User doesn't exists. Please signup instead",
        isSignedIn: false,
      });
    }
    const isPasswordVerified = await userValidation.checkUserPassword(user);
    if (!isPasswordVerified) {
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Wrong password",
        isSignedIn: false,
      });
    }
    const isEmailVerified = await userValidation.checkEmailIsVerified(
      user.email
    );

    if (!isEmailVerified) {
      const verificationToken = existingUser.verificationToken;
      const verificationLink = `http://localhost:3000/user/verify?token=${verificationToken}`;
      await sendMail(user.email, verificationLink);
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Please verify your email first",
        isSignedIn: false,
        isEmailVerified: false,
      });
    }
    // console.log(existingUser);
    const authToken = await JWT.generateAndStoreJwtUser(existingUser);
    res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      message: "User signed in succesfully",
      authToken: authToken,
      isSignedIn: true,
      isEmailVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

userController.checkEmailIsVerified = async (req, res, next) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const isEmailVerified = await userValidation.checkEmailIsVerified(email);
    // console.log(isEmailVerified);
    if (isEmailVerified) {
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Email has been verified succesfully",
        isEmailVerified: isEmailVerified,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Please verify your email and try again",
        isEmailVerified: isEmailVerified,
      });
    }
  } catch (error) {
    next(error);
  }
};

userController.signout = async (req, res) => {
  res.json({ message: "User has been signed out" });
};

//////////////// problems ////////////////

userController.getProblems = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const problems = await userService.getProblems(decodedToken.userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Problems recieved succesfully",
      problems: problems,
    });
  } catch (error) {
    next(error);
  }
};

userController.postProblem = async (req, res, next) => {
  try {
    const { title, description, status, deadline } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const problemData = {
      userId: decodedToken.userId,
      problemId: uuid(),
      title: title,
      description: description,
      status: status,
      deadline: deadline,
    };
    const newProblem = await userService.createProblem(problemData);
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "The problem has been saved succesfully",
      problem: newProblem,
    });
  } catch (error) {
    next(error);
  }
};

userController.editProblem = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const { problemId } = req.params;
    const { title, description, status, deadline } = req.body;
    const problemData = {
      // userId: decodedToken.userId,
      // problemId: uuid(),
      title: title,
      description: description,
      status: status,
      deadline: deadline,
    };

    const updatedProblem = await userService.editProblem(
      decodedToken.userId,
      problemId,
      problemData
    );
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "The problem has been updated succesfully",
      problem: updatedProblem,
    });
  } catch (error) {
    next(error);
  }
};

userController.deleteProblem = async (req, res, next) => {
  try {
    const { problemId } = req.body;
    await userService.deleteProblem(problemId);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The problem has been deleted succesfully",
    });
  } catch (error) {
    next(error);
  }
};

//////////////// blogs ////////////////

userController.getBlogs = async (req, res, next) => {
  try {
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const decodedToken = await JWT.checkJwtStatus(req);
    const userId = decodedToken.userId;

    const blogs = await userService.getBlogs(skip, limit);

    if (blogs.length == 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No blogs left",
      });
    }

    const updatedBlogs = await userService.updateBlogLikedStatus(blogs, userId);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The blogs has been recieved",
      blogs: updatedBlogs,
    });
  } catch (error) {
    next(error);
  }
};

userController.commentOnBlog = async (req, res, next) => {
  try {
    const { blogId, comment } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const userId = decodedToken.userId;

    const existingUser = await userService.getUserDetails(userId);

    if (!existingUser) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No user found",
      });
    }

    const blog = await userValidation.checkExistingBlog(blogId);

    if (!blog) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No blog found" });
    }

    const comments = {
      comment: comment,
      commentedBy: userId,
      userType: "advocate",
    };

    const updateBlog = await advocateService.editBlog(blog.advocateId, blogId, {
      title: blog.title,
      description: blog.description,
      comments: comments,
    });

    // const io = getIoInstance();

    // io.emit("commentOnBlog", { userId, blogId, comment });

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The comment has been posted succesfully",
      updateBlog: updateBlog.comments,
    });
  } catch (error) {
    next(error);
  }
};

userController.likeOrUnlikeBlog = async (req, res, next) => {
  try {
    const { blogId } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const userId = decodedToken.userId;

    // const io = getIoInstance();

    const existingUser = await userService.getUserDetails(userId);

    if (!existingUser) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No user found",
      });
    }

    const blog = await userValidation.checkExistingBlog(blogId);

    if (!blog) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No blog found" });
    }

    const liked = await userValidation.checkIfBlogIsLiked(blogId, userId);

    const likes = {
      likedBy: userId,
      userType: "user",
    };

    const updateBlog = await advocateService.editBlog(blog.advocateId, blogId, {
      title: blog.title,
      description: blog.description,
      likes,
      liked,
      userId,
    });

    // const isLiked = !liked;

    // io.emit("likeOrUnlikeBlog", { isLiked, userId, blogId });

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: !liked
        ? "The post has been liked succesfully"
        : "The post has been disliked succesfully",
      updateBlog: updateBlog.likes,
    });
  } catch (error) {
    next(error);
  }
};

//////////////// advocates ////////////////

userController.searchAdvocateByUserName = async (req, res, next) => {
  try {
    const { userName } = req.body;
    const skip = req.body.skip ? Number(req.body.skip) : 0;
    const limit = req.body.limit ? Number(req.body.limit) : 10;

    const advocate = await userService.searchAdvocateByUserName(
      userName,
      skip,
      limit
    );
    if (advocate.length == 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No advocate found",
      });
    }
    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The advocates found are:",
      advocate: advocate,
    });
  } catch (error) {
    next(error);
  }
};

userController.searchAdvocateByName = async (req, res, next) => {
  try {
    const { name } = req.body;
    const skip = req.body.skip ? Number(req.body.skip) : 0;
    const limit = req.body.limit ? Number(req.body.limit) : 10;

    const advocate = await userService.searchAdvocateByName(name, skip, limit);
    if (advocate.length == 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No advocate found",
      });
    }
    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The advocates found are:",
      advocate: advocate,
    });
  } catch (error) {
    next(error);
  }
};

userController.searchByLocation = async (req, res, next) => {
  try {
    const { city } = req.body;

    const limit = req.body.limit ? req.body.limit : 5;
    const skip = req.body.skip ? skip : 0;

    const nearbyAdvocates = await userService.searchByLocation(
      city,
      limit,
      skip
    );

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "Nearby advocates are: ",
      nearbyAdvocates: nearbyAdvocates,
    });
  } catch (error) {
    next(error);
  }
};

userController.nearbyAdvocates = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const userId = decodedToken.userId;

    const existingUser = await userService.getUserDetails(userId);

    if (!existingUser) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No User found" });
    }

    const location = existingUser.location.coordinates;

    const limit = req.body.limit ? req.body.limit : 5;
    const skip = req.body.skip ? skip : 0;

    const nearbyAdvocates = await userService.nearbyAdvocates(
      location,
      limit,
      skip
    );

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "Nearby advocates are: ",
      nearbyAdvocates: nearbyAdvocates,
    });
  } catch (error) {
    next(error);
  }
};

userController.getUserProfile = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const userId = decodedToken.userId;

    const existingUser = await userService.getUserDetails(userId);

    if (!existingUser) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No User found" });
    }
    const { name, email, phone, profileImage } = existingUser;
    const user = {
      name: name,
      email: email,
      phone: phone,
      profileImage: profileImage,
    };

    return res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: "User Details Found", user: user });
  } catch (error) {
    next(error);
  }
};
module.exports = userController;
