//Libs
const { v4: uuid } = require("uuid");
const fs = require("fs");

//configs
const { getIoInstance } = require("../../config/socketio");

//Variables
const advocateController = {};

//Helpers
const { HTTP_STATUS_CODES } = require("../helpers/statusCodes");
const hash = require("../helpers/hash");
const sendMail = require("../helpers/nodemailer");
const JWT = require("../helpers/jwt");

//Validations
const advocateValidation = require("../validations/advocate");

//Services
const advocateService = require("../services/advocate");
const userService = require("../services/user");
const { timeStamp } = require("console");

advocateController.signup = async (req, res, next) => {
  try {
    const {
      userName,
      name,
      email,
      password,
      phone,
      dateOfBirth,
      address,
      enrollmentNumber,
      durationOfPractice,
      areasOfExpertise,
      nameOfUniversity,
      yearOfGraduation,
      bio,
    } = req.body;

    const certificatePath = req.files[0].path;
    const enrollmentCertificate = fs.readFileSync(certificatePath);

    const profilePath = req.files[1].path;
    const profileImage = fs.readFileSync(profilePath);

    const existingAdvocate = await advocateValidation.checkExistingAdvocate(
      email,
      enrollmentNumber
    );
    if (existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Advocate already exists. Please signin instead",
        isSignedUp: false,
      });
    }

    const existingUserName = await advocateValidation.checkUserNameAvaiability(
      userName
    );

    if (existingUserName) {
      fs.unlinkSync(req.file.path);
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Username already exists",
        isSignedUp: false,
        userNameAvailable: false,
      });
    }

    const verificationToken = Math.random().toString(36).substring(7);
    const hashedPassword = await hash.hashPassword(password);
    const newAdvocate = await advocateService.createAdvocate({
      advocateId: uuid(),
      personalDetails: {
        userName: userName,
        name: name,
        dateOfBirth: dateOfBirth,
        address: address,
        bio: bio,
        profileImage: profileImage,
      },
      contactDetails: {
        email: email,
        phone: phone,
      },
      verificationDetails: {
        verificationToken: verificationToken,
      },
      workDetails: {
        enrollmentNumber: enrollmentNumber,
        durationOfPractice: durationOfPractice,
        areasOfExpertise: areasOfExpertise,
        enrollmentCertificate: enrollmentCertificate,
      },
      educationDetails: {
        nameOfUniversity: nameOfUniversity,
        yearOfGraduation: yearOfGraduation,
      },
      password: hashedPassword,

      // location: location,
    });

    fs.unlinkSync(req.files[0].path);
    fs.unlinkSync(req.files[1].path);

    const verificationLink = `http://localhost:3000/advocate/verify?token=${verificationToken}`;

    await sendMail(email, verificationLink);

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Advocate signed up, please verify your email",
      isSignedUp: true,
      userNameAvailable: true,
      advocate: {
        id: newAdvocate.advocateId,
        name: newAdvocate.personalDetails.name,
        email: newAdvocate.contactDetails.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

advocateController.verifyUser = async (req, res, next) => {
  const { token } = req.query;

  try {
    const existingUser = advocateValidation.checkVerificationToken(res, token);

    if (!existingUser) {
      return res
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: "Invalid verification token" });
    }
    await advocateService.updateVerficationStatus(token);
    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: "Email verification successful" });
  } catch (error) {
    next(error);
  }
};

advocateController.signin = async (req, res, next) => {
  try {
    const advocate = req.body.advocate;
    const { email, enrollmentNumber } = advocate;
    const existingAdvocate = await advocateValidation.checkExistingAdvocate(
      email,
      enrollmentNumber
    );

    if (!existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Advocate doesn't exists. Please signup instead",
        isSignedIn: false,
      });
    }

    const isAdvocateVerified = await advocateValidation.checkAdvocateIsVerified(
      email,
      enrollmentNumber
    );

    if (!isAdvocateVerified) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message:
          "Advocate hasn't been verified yet. Please wait for the verfication process to complete",
        isSignedIn: false,
      });
    }

    const isPasswordVerified = await advocateValidation.checkAdvocatePassword(
      advocate
    );
    if (!isPasswordVerified) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Wrong password",
        isSignedIn: false,
      });
    }
    const isEmailVerified = await advocateValidation.checkEmailIsVerified(
      email,
      enrollmentNumber
    );

    if (!isEmailVerified) {
      const verificationToken =
        existingAdvocate.verificationDetails.verificationToken;
      const verificationLink = `http://localhost:3000/advocate/verify?token=${verificationToken}`;
      await sendMail(email, verificationLink);
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Please verify your email first",
        isSignedIn: false,
      });
    }
    // console.log(existingUser);
    const authToken = await JWT.generateAndStoreJwtAdvocate(existingAdvocate);
    res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      message: "Advocate signed in succesfully",
      authToken: authToken,
      isSignedIn: true,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.postBlog = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const imagePath = req.file.path;
    const image = fs.readFileSync(imagePath);

    const blogData = {
      advocateId: decodedToken.advocateId,
      blogId: uuid(),
      title: title,
      description: description,
      image: image,
      tags: tags,
    };

    const newBlog = await advocateService.createBlog(blogData);
    fs.unlinkSync(req.file.path);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The blog has been saved succesfully",
      blog: newBlog,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.editBlog = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const { title, description, blogId } = req.body;
    const blogData = {
      title: title,
      description: description,
    };

    const updatedBlog = await advocateService.editBlog(
      decodedToken.advocateId,
      blogId,
      blogData
    );

    if (!updatedBlog) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "The blog does not exist",
        // blog: updatedBlog,
      });
    }

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The blog has been updated succesfully",
      // blog: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.deleteAccount = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    await advocateService.deleteAccount(decodedToken.advocateId);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The account has been deleted succesfully",
      // blog: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getProfileDetails = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const advocate = await advocateService.getProfileDetails(
      decodedToken.advocateId
    );
    if (!advocate) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "The advocate doesnt exist" });
    }

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The profile details have been fetched succesfully",
      advocate: advocate,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getProblems = async (req, res, next) => {
  try {
    const skip = req.body.skip ? Number(req.body.skip) : 0;
    const limit = req.body.limit ? Number(req.body.limit) : 10;
    // const decodedToken = JWT.checkJwtStatus(req);
    const problems = await advocateService.getProblems(skip, limit);

    if (problems.length == 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "The problems doesnt exist",
      });
    }

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The problems have been fetched succesfully",
      problems,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.sendCaseAcceptRequest = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const { userId } = req.body;
    const advocateDetails = await advocateService.getProfileDetails(
      decodedToken.advocateId
    );
    const userDetails = await userService.getUserDetails(userId);

    if (!userDetails) {
      return res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "The user does not exist" });
    }

    const io = getIoInstance();

    const { personalDetails, contactDetails, workDetails, educationDetails } =
      advocateDetails;

    const { userName, name, address } = personalDetails;
    const { email, phone } = contactDetails;
    const { nameOfUniversity, yearOfGraduation } = educationDetails;
    const { durationOfPractice, areasOfExpertise } = workDetails;

    const advocateInfo = {
      userName,
      name,
      address,
      email,
      phone,
      nameOfUniversity,
      yearOfGraduation,
      durationOfPractice,
      areasOfExpertise,
    };

    const notification = {
      title: "title1",
      description: "desc1",
      data: advocateInfo,
      timeStamp: Date.now(),
    };

    const updatedNotification = await userService.storeNotification(
      userId,
      notification
    );

    io.to(userDetails.socketId).emit("caseAcceptRequest", advocateInfo, userId);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The case accept request has been sent succesfully",
      notification: updatedNotification,
    });

    // console.log("Received: ", advocateDetails.advocateId);
  } catch (error) {
    next(error);
  }
};

module.exports = advocateController;
