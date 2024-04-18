//Libs
const { v4: uuid } = require("uuid");

//helpers
const sendMail = require("../helpers/nodemailer");
const JWT = require("../helpers/jwt");
const hash = require("../helpers/hash");
const { HTTP_STATUS_CODES } = require("../helpers/statusCodes");

//services,controllers,validations
const userController = {};
const userServices = require("../services/user");
const userValidation = require("../validations/user");
const user = require("../models/user");

//////////////// signup,signin ////////////////

userController.signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await userValidation.checkExistingUser(email);
    if (existingUser) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "User already exists. Please signin instead",
        isSignedUp: false,
      });
    }
    const verificationToken = Math.random().toString(36).substring(7);
    const hashedPassword = await hash.hashPassword(password);
    const newUser = await userServices.createUser({
      userId: uuid(),
      socketId: uuid(),
      name,
      email,
      password: hashedPassword,
      phone: phone,
      verificationToken,
      // location: location,
    });

    const verificationLink = `http://localhost:3000/user/verify?token=${verificationToken}`;

    await sendMail(email, verificationLink);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "User signed up, please verify your email",
      isSignedUp: true,
      // authToken: authToken,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
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
    await userServices.updateVerficationStatus(res, token);
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
    const problems = await userServices.getProblems(decodedToken.userId);

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
    const newProblem = await userServices.createProblem(problemData);
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

    const updatedProblem = await userServices.editProblem(
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
    await userServices.deleteProblem(problemId);

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
    const skip = req.body.skip ? Number(req.body.skip) : 0;
    const limit = req.body.limit ? Number(req.body.limit) : 10;
    // const decodedToken = JWT.checkJwtStatus(req);
    const blogs = await userServices.getBlogs(skip, limit);

    if (blogs.length == 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No blogs left",
      });
    }

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The blogs has been recieved",
      blogs: blogs,
    });
  } catch (error) {
    next(error);
  }
};

//////////////// advocates ////////////////

userController.searchAdvocate = async (req, res, next) => {
  try {
    const { userName } = req.body;
    const skip = req.body.skip ? Number(req.body.skip) : 0;
    const limit = req.body.limit ? Number(req.body.limit) : 10;

    const advocate = await userServices.searchAdvocate(userName, skip, limit);
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

// userController.searchByLocation = async (req, res, next) => {
//   try {
//     const { maxDistance, latitude, longitude } = req.body;
//     const limit = req.body.limit ? req.body.limit : 5;

//     const advocates = userServices.searchByLocation(
//       maxDistance,
//       latitude,
//       longitude
//     );
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = userController;
