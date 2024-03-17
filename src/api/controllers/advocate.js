//Libs
const { v4: uuid } = require("uuid");
const fs = require("fs");

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

advocateController.signup = async (req, res, next) => {
  try {
    const {
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
    } = req.body;

    const enrollmentCertificate = fs.readFileSync(req.file.path);

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
    const verificationToken = Math.random().toString(36).substring(7);
    const hashedPassword = await hash.hashPassword(password);
    const newAdvocate = await advocateService.createAdvocate({
      advocateId: uuid(),
      personalDetails: {
        name: name,
        dateOfBirth: dateOfBirth,
        address: address,
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

    fs.unlinkSync(req.file.path);

    const verificationLink = `http://localhost:3000/advocate/verify?token=${verificationToken}`;

    await sendMail(email, verificationLink);

    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Advocate signed up, please verify your email",
      isSignedUp: true,
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
    const existingAdvocate = await advocateValidation.checkExistingAdvocate(
      advocate.email,
      advocate.enrollmentNumber
    );

    if (!existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Advocate doesn't exists. Please signup instead",
        isSignedIn: false,
      });
    }

    const isAdvocateVerified = await advocateValidation.checkAdvocateIsVerified(
      advocate.email,
      advocate.enrollmentNumber
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
      advocate.email,
      advocate.enrollmentNumber
    );

    if (!isEmailVerified) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Please verify your email first",
        isSignedIn: false,
      });
    }
    // console.log(existingUser);
    const authToken = await JWT.generateAndStoreJwt(existingAdvocate);
    res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      message: "Advocate signed in succesfully",
      authToken: authToken,
      isSignedIn: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = advocateController;
