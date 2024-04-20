const { timeStamp } = require("console");
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    advocateId: {
      type: String,
      ref: "advocate",
      required: true,
    },
    blogId: {
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
    image: {
      type: mongoose.Schema.Types.Mixed,
    },
    comments: {
      commentCounts: {
        type: Number,
        default: 0,
      },
      comment: {
        type: String,
      },
      commentedBy: {
        type: [
          {
            type: String,
            ref: "user",
          },
        ],
      },
    },
    likes: {
      likeCounts: {
        type: Number,
        default: 0,
      },
      likedBy: {
        type: [
          {
            type: String,
            ref: "user",
          },
        ],
      },
    },
    tags: {
      type: [String],
    },
    timeStamp: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.virtual("advocates", {
  ref: "advocate",
  localField: "advocateId",
  foreignField: "advocateId",
});

const blog = new mongoose.model("blog", blogSchema);

module.exports = blog;
