const mongoose = require("mongoose");
const problem = require("./problem");
// const db = require("../../config/db");

const advocateSchema = new mongoose.Schema(
  {
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
    problemsHandled: [
      {
        type: {
          userId: {
            type: String,
            ref: "user",
          },
          problemId: {
            type: String,
            ref: "problem",
          },
          rating: {
            type: Number,
          },
          review: {
            type: String,
          },
        },
      },
    ],
    workStatus: {
      type: Boolean,
      default: true,
    },
    timeStamp: {
      type: Date,
      default: Date.now(),
    },
    problemsRequested: [
      {
        type: {
          userId: {
            type: String,
            ref: "user",
          },
          problemId: {
            type: String,
            ref: "problem",
          },
          status: {
            type: String, //declined//accepted//pending
          },
        },
      },
    ],
    notifications: [
      {
        type: {
          title: {
            type: String,
          },
          description: {
            type: String,
          },
          userInfo: {
            type: {
              userId: {
                type: String,
              },
              userName: {
                type: String,
              },
              name: {
                type: String,
              },
              profileImage: {
                type: mongoose.Schema.Types.Mixed,
              },
            },
          },
          problemInfo: {
            type: {
              problemId: {
                type: String,
              },
              title: {
                type: String,
              },
              description: {
                type: String,
              },
            },
          },
          timeStamp: {
            type: Date,
            default: Date.now(),
            required: true,
          },
          read: {
            type: Boolean,
          },
        },
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// advocateSchema.index({ "personalDetails.userName": "text" });

advocateSchema.virtual("problemRequestedUserDetails", {
  ref: "user",
  localField: "problemsRequested.userId",
  foreignField: "userId",
});

advocateSchema.virtual("problemRequestedProblemDetails", {
  ref: "problem",
  localField: "problemsRequested.problemId",
  foreignField: "problemId",
});

const advocate = mongoose.model("advocate", advocateSchema);

// db.collection("advocates").createIndex({ "location.coordinates": "2dsphere" });

module.exports = advocate;
