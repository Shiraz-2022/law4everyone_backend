const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "user",
    required: true,
  },
  chatId: {
    type: String,
    ref: "lawbotconversation",
    required: true,
  },
  responseId: {
    type: String,
    required: true,
  },
  promptId: {
    type: String,
    ref: "prompt",
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const response = mongoose.model("response", responseSchema);

module.exports = response;
