//Models
const Advocate = require("../models/advocate");

//Validatons
const advocateValidation = require("../validations/advocate");

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

module.exports = advocateService;
