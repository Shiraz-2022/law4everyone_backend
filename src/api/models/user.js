const mongoose = require("mongoose");
const { type } = require("os");
// const db = require("../../config/db");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  socketId: {
    unique: true,
    type: String,
  },
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    unique: true,
    required: true,
  },
  address: {
    type: {
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
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  notifications: [
    {
      type: {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
        data: {
          type: mongoose.Schema.Types.Mixed,
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
  profileImage: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  problemId: {
    type: String,
    ref: "problem",
  },
  tagsProbability: [
    {
      type: Number,
      required: true,
    },
  ],
});

const user = mongoose.model("user", userSchema);

// db.collection("users").createIndex({ "location.coordinates": "2dsphere" });

module.exports = user;
