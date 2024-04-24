const mongoose = require("mongoose");
// const db = require("../../config/db");

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
        // houseNo: {
        //   type: String,
        // },
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
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere", // Create a 2dsphere index on the coordinates field
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

// db.collection("advocates").createIndex({ "location.coordinates": "2dsphere" });

module.exports = advocate;
