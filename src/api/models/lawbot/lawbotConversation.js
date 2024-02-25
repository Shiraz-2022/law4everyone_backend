const mongoose = require("mongoose");

const lawbotconversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "user",
    required: true,
  },
  chatId: {
    type: String,
    required: true,
  },
  prompts: [
    {
      type: String,
      ref: "prompt",
      required: true,
    },
  ],
  responses: [
    {
      type: String,
      ref: "response",
      required: true,
    },
  ],
});

const lawbotconversation = new mongoose.model(
  "lawbotconversation",
  lawbotconversationSchema
);

module.exports = lawbotconversation;
