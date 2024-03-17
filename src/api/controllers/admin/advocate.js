//Variables
const advocateController = {};

//Helpers
const { HTTP_STATUS_CODES } = require("../../helpers/statusCodes");

//Validations
const advocateValidation = require("../../validations/advocate");

//Services
const advocateService = require("../../services/advocate");

advocateController.updateAdvocateVerficationStatus = async (req, res, next) => {
  try {
    const { email, enrollmentNumber } = req.body;
    const existingUser = await advocateValidation.checkExistingAdvocate(
      email,
      enrollmentNumber
    );

    if (!existingUser) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "Advocate doesn't exist",
      });
    }

    if (existingUser.verificationDetails.isAdvocateVerified) {
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "Advocate has already been verified",
      });
    }

    const updatedUser = await advocateService.updateAdvcoateVerificationStatus(
      email,
      enrollmentNumber
    );

    return res.status(HTTP_STATUS_CODES.OK).json({
      message: "Advocate has been verified succesfully",
      updatedUser: updatedUser.verificationDetails,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = advocateController;
