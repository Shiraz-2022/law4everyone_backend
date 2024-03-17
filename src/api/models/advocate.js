const mongoose = require("mongoose");

const advocateSchema = new mongoose.Schema({
  advocateId: {
    type: String,
    required: true,
  },
  personalDetails: {
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },

  contactDetails: {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  },

  password: {
    type: String,
    required: true,
  },

  location: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },

  verificationDetails: {
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },

    isAdvocateVerified: {
      type: Boolean,
      default: false,
    },
    noOfVerificationTrials: {
      type: Number,
      default: 0,
    },
  },

  educationDetails: {
    nameOfUniversity: {
      type: String,
      required: true,
    },
    yearOfGraduation: {
      type: Number,
      required: true,
    },
  },

  workDetails: {
    enrollmentNumber: {
      type: String,
      required: true,
    },

    durationOfPractice: {
      type: String,
    },
    areasOfExpertise: {
      type: [String],
    },
    enrollmentCertificate: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },

  timeStamp: {
    type: Date,
    default: Date.now(),
  },
});

const advocate = mongoose.model("advocate", advocateSchema);

module.exports = advocate;
