const mongoose = require("mongoose");
const { type } = require("os");

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "user",
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    timeStamp: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    noOfRequests: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

problemSchema.virtual("user", {
  ref: "user",
  localField: "userId",
  foreignField: "userId",
  justOne: true,
});

const problem = new mongoose.model("problem", problemSchema);

module.exports = problem;
