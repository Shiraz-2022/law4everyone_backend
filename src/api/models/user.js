const mongoose = require("mongoose");

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
  location: {
    type: {
      latitude: Number,
      longitude: Number,
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

module.exports = user;
