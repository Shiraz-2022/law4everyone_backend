//models
const LawbotConversation = require("../models/lawbot/lawbotConversation.js");

//Variables
const openaiValidation = {};

openaiValidation.checkIfChatExists = async (chatId) => {
  const chat = await LawbotConversation.findOne({ chatId });
  return chat;
};

module.exports = openaiValidation;
