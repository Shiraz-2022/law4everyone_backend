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
});

const blog = new mongoose.model("blog", blogSchema);

module.exports = blog;
