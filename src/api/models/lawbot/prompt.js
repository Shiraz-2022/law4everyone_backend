const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
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
  promptId: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const prompt = mongoose.model("prompt", promptSchema);

module.exports = prompt;
