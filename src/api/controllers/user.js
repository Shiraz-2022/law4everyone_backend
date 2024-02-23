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
      name,
      email,
      password: hashedPassword,
      phone: phone,
      verificationToken,
      // location: location,
    });
    // const authToken = await JWT.generateAndStoreJwt(res, newUser);

    const verificationLink = `http://localhost:3000/user/verify?token=${verificationToken}`;

    await sendMail(next, email, verificationLink);

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "User signed up, please verify your email",
      isSignedUp: true,
      // authToken: authToken,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

userController.verifyUser = async (req, res) => {
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
    res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json("Error verifying email:", error);
  }
};

userController.signin = async (req, res, next) => {
  try {
    const user = req.body.user;
    const existingUser = await userValidation.checkExistingUser(
      res,
      user.email
    );

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
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Please verify your email first",
        isSignedIn: false,
      });
    }
    // console.log(existingUser);
    const authToken = await JWT.generateAndStoreJwt(existingUser);
    res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      message: "User signed in succesfully",
      authToken: authToken,
      isSignedIn: true,
    });
  } catch (error) {
    next(error);
  }
};

userController.signout = async (req, res) => {
  // res.clearCookie("userAuthToken");
  res.json({ message: "User has been signed out" });
};

userController.postProblem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const problemData = {
      userId: decodedToken.userId,
      problemId: uuid(),
      title: title,
      description: description,
      status: status,
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

module.exports = userController;
