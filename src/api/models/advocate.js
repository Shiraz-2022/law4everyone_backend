const mongoose = require("mongoose");

const advocateSchema = new mongoose.Schema({
  advocateId: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
  },
  personalDetails: {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: {
        houseNo: {
          type: String,
        },
        district: {
          type: String,
        },
        city: {
          type: String,
        },
        zipCode: {
          type: Number,
        },
        state: {
          type: String,
        },
      },
      required: true,
    },
    bio: {
      type: String,
    },
    profileImage: {
      type: mongoose.Schema.Types.Mixed,
      // required: true,
    },
  },

  contactDetails: {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
  },

  password: {
    type: String,
    required: true,
  },

  location: {
    type: {
      coordinates: {
        type: {
          latitude: { type: String },
          longitude: { type: String },
        },
      },
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
      unique: true,
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

// advocateSchema.index({ "personalDetails.userName": "text" });

const advocate = mongoose.model("advocate", advocateSchema);

module.exports = advocate;
