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
  //   promptId: {
  //     type: String,
  //     ref: "prompt",
  //   },
  //   responseId: {
  //     type: String,
  //     ref: "response",
  //   },
});

const lawbotconversation = new mongoose.model(
  "lawbotconversation",
  lawbotconversationSchema
);

module.exports = lawbotconversation;
