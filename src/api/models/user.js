const mongoose = require("mongoose");
// const db = require("../../config/db");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
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
      title: String,
      description: String,
      data: mongoose.Schema.Types.Mixed,
      timeStamp: Date,
      read: Boolean,
    },
  ],
  profileImage: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const user = mongoose.model("user", userSchema);

// db.collection("users").createIndex({ "location.coordinates": "2dsphere" });

module.exports = user;
