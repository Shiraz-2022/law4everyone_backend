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
const geoCode = require("../helpers/geoCode");

//Validations
const advocateValidation = require("../validations/advocate");
const userValidation = require("../validations/user");

//Services
const advocateService = require("../services/advocate");
const userService = require("../services/user");

advocateController.signup = async (req, res, next) => {
  try {
    const {
      userName,
      name,
      email,
      password,
      phone,
      dateOfBirth,
      // address,
      district,
      city,
      zipCode,
      state,
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
      fs.unlinkSync(certificatePath);
      fs.unlinkSync(profilePath);
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Username already exists",
        isSignedUp: false,
        isUserNameAvailable: false,
      });
    }

    const existingPhoneNumber =
      await advocateValidation.checkExistingPhoneNumber(phone);

    if (existingPhoneNumber) {
      fs.unlinkSync(certificatePath);
      fs.unlinkSync(profilePath);
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Phone number already exists",
        isSignedUp: false,
        isPhoneNumberAvailable: false,
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

    // const { houseNo, district, city, zipCode, state } = address;

    const newAdvocate = await advocateService.createAdvocate({
      advocateId: uuid(),
      personalDetails: {
        userName: userName,
        name: name,
        dateOfBirth: dateOfBirth,
        address: {
          district: district,
          city: city,
          zipCode: zipCode,
          state: state,
        },
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
      location: {
        coordinates: coordinates,
      },

      // location: location,
    });

    fs.unlinkSync(certificatePath);
    fs.unlinkSync(profilePath);

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
    const { email } = advocate;
    const existingAdvocate =
      await advocateValidation.checkExistingAdvocateByEmail(email);

    if (!existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message: "Advocate doesn't exists. Please signup instead",
        isSignedIn: false,
      });
    }

    const isAdvocateVerified = await advocateValidation.checkAdvocateIsVerified(
      email
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
      email
    );

    if (!isEmailVerified) {
      const verificationToken =
        existingAdvocate.verificationDetails.verificationToken;
      const verificationLink = `http://localhost:3000/advocate/verify?token=${verificationToken}`;
      await sendMail(email, verificationLink);
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        message: "Please verify your email first",
        isSignedIn: false,
        isEmailVerified: false,
      });
    }
    // console.log(existingUser);
    const authToken = await JWT.generateAndStoreJwtAdvocate(existingAdvocate);
    return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      message: "Advocate signed in succesfully",
      authToken: authToken,
      isSignedIn: true,
      isEmailVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.postBlog = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;
    const parsedTags = JSON.parse(tags);

    const decodedToken = await JWT.checkJwtStatus(req);
    const { advocateId } = decodedToken;
    const imagePath = req.file.path;
    const image = fs.readFileSync(imagePath);

    const newTagsProbability = await advocateService.updateBlogTagsProbabilty(
      parsedTags
    );

    const blogId = uuid();

    const blogData = {
      advocateId: advocateId,
      blogId: blogId,
      title: title,
      description: description,
      image: image,
      tags: parsedTags,
      tagsProbability: newTagsProbability,
    };

    const newBlog = await advocateService.createBlog(blogData);
    const updatedAdvocate = await advocateService.updateAdvocateBlogs(
      advocateId,
      blogId
    );
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
    const advocateId = decodedToken.advocateId;
    const advocate = await advocateService.getProfileDetails(advocateId);
    if (!advocate) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "The advocate doesnt exist" });
    }
    const { personalDetails, contactDetails } = advocate;
    const { userName, name, profileImage, address, bio, dateOfBirth } =
      personalDetails;

    const { email, phone } = contactDetails;

    const { workStatus } = advocate;

    const advocateDetails = {
      advocateId: advocateId,
      userName: userName,
      name: name,
      email: email,
      phone: phone,
      profileImage: profileImage,
      address: address,
      workStatus: workStatus,
      bio: bio,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The profile details have been fetched succesfully",
      advocate: advocateDetails,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getProblems = async (req, res, next) => {
  try {
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 7;
    const decodedToken = await JWT.checkJwtStatus(req);
    const { advocateId } = decodedToken;

    const problems = await advocateService.getProblems(skip, limit, advocateId);

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
    const { problemId } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const { advocateId } = decodedToken;
    const problem = await advocateService.getProblemDetails(problemId);

    const { noOfRequests, userId } = problem;
    const advocateDetails = await advocateService.getProfileDetails(advocateId);
    const userDetails = await userService.getUserDetails(userId);

    if (!userDetails) {
      return res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "The user does not exist" });
    }

    if (noOfRequests == 10) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        message:
          "10 advocates have already send request, please wait for one of them to be declined",
        isCaseRequestAllowed: false,
      });
    }

    const io = getIoInstance();

    const { personalDetails, contactDetails, workDetails, educationDetails } =
      advocateDetails;

    const { userName, name, profileImage } = personalDetails;
    // const { email } = contactDetails;
    // const { nameOfUniversity, yearOfGraduation } = educationDetails;
    // const { durationOfPractice, areasOfExpertise } = workDetails;

    const advocateInfo = {
      userName,
      name,
      profileImage,
      advocateId,
    };

    const notification = {
      title: "Case Accept Request",
      description: "Your case has recieved a request",
      advocateInfo: advocateInfo,
      problemId: problemId,
    };

    const updatedUser = await userService.storeNotification(
      userId,
      notification
    );

    const updatedNotification = updatedUser.notifications;

    io.to(userDetails.socketId).emit("caseAcceptRequest", updatedNotification);

    await advocateService.updateNoOfProblemRequests(noOfRequests, problemId);

    await advocateService.updateProblemsRequested(
      problemId,
      userId,
      advocateId
    );

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The case accept request has been sent succesfully",
      isCaseRequestAllowed: true,
      notification: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.likeOrUnlikeBlog = async (req, res, next) => {
  try {
    const { blogId } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const advocateId = decodedToken.advocateId;

    // const io = getIoInstance();

    const existingAdvocate = await advocateService.getProfileDetails(
      advocateId
    );

    if (!existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No advocate found",
      });
    }

    const blog = await userValidation.checkExistingBlog(blogId);

    if (!blog) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No blog found" });
    }

    const liked = await advocateValidation.checkIfBlogIsLiked(
      blogId,
      advocateId
    );

    const likes = {
      likedBy: advocateId,
      userType: "advocate",
    };

    const updateBlog = await advocateService.editBlog(blog.advocateId, blogId, {
      title: blog.title,
      description: blog.description,
      likes,
      liked,
      advocateId,
    });

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

advocateController.commentOnBlog = async (req, res, next) => {
  try {
    const { blogId, comment } = req.body;
    const decodedToken = await JWT.checkJwtStatus(req);
    const advocateId = decodedToken.advocateId;

    const existingAdvocate = await advocateService.getProfileDetails(
      advocateId
    );

    if (!existingAdvocate) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        message: "No advocate found",
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
      commentedBy: advocateId,
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

advocateController.changeWorkStatus = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const advocateId = decodedToken.advocateId;

    const workStatus = await advocateService.changeWorkStatus(advocateId);

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The work status has been changed succesfully",
      workStatus: workStatus,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.viewUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const existingUser = await userService.getUserDetails(userId);

    if (!existingUser) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No user found" });
    }

    const { userName, name, phone, email, profileImage } = existingUser;

    const userInfo = {
      userName,
      name,
      phone,
      email,
      profileImage,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The user profile has been fetched succesfully",
      userInfo: userInfo,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getRequestedProblems = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const { advocateId } = decodedToken;

    const populatedAdvocate = await advocateService.getRequestedProblems(
      advocateId
    );

    const {
      problemsRequested,
      problemRequestedUserDetails,
      problemRequestedProblemDetails,
    } = populatedAdvocate;

    const requestedProblems = {
      problemsRequested: problemsRequested,
      userDetails: problemRequestedUserDetails,
      problemDetails: problemRequestedProblemDetails,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "The requested problems have been fetched succesfully",
      requestedProblems: requestedProblems,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getNotifications = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const advocateId = decodedToken.advocateId;
    const existingAdvocate = await advocateService.getProfileDetails(
      advocateId
    );

    if (!existingAdvocate) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: "No advocatefound" });
    }

    const { notifications } = existingAdvocate;

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "Notifications fetched succesfully",
      notifications: notifications,
    });
  } catch (error) {
    next(error);
  }
};

advocateController.getMyBlogs = async (req, res, next) => {
  try {
    const decodedToken = await JWT.checkJwtStatus(req);
    const { advocateId } = decodedToken;

    const advocate = await advocateService.getMyBlogs(advocateId);
    console.log(advocate);

    const { blogsByAdvocate } = advocate;

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "Blogs fetched succesfully",
      blogsByAdvocate: blogsByAdvocate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = advocateController;
