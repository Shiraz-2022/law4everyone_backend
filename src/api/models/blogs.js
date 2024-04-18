const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
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
});

const blog = new mongoose.model("blog", blogSchema);

module.exports = blog;
