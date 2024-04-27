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
    comments: [
      {
        type: {
          comment: {
            type: String,
          },
          userType: {
            type: String,
          },
          commentedBy: {
            type: String,
            ref: "user",
          },
          timeStamp: {
            type: Date,
            required: true,
            default: Date.now(),
          },
        },
      },
    ],
    isLiked: {
      type: Boolean,
      default: false,
      required: true,
    },
    likes: [
      {
        type: {
          likedBy: {
            type: String,
            ref: "user",
          },
          userType: {
            type: String,
          },
          timeStamp: {
            type: Date,
            required: true,
            default: Date.now(),
          },
        },
      },
    ],

    tags: [
      {
        type: String,
      },
    ],
    tagsProbability: [
      {
        type: Number,
        required: true,
      },
    ],
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

blogSchema.virtual("commentedByDetails", {
  ref: "user",
  localField: "comments.commentedBy",
  foreignField: "userId",
  justOne: true,
});

const blog = new mongoose.model("blog", blogSchema);

module.exports = blog;
