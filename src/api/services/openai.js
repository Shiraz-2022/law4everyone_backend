//Libs,Configs
const openai = require("../../config/openai");
const fs = require("fs");

//models
const LawbotConversation = require("../models/lawbot/lawbotConversation");
const Prompt = require("../models/lawbot/prompt");
const Response = require("../models/lawbot/response");

//variables
const openaiServices = {};

openaiServices.createResponse = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `What are the legal considerations for [${prompt}]?`,
      },
      {
        role: "system",
        content:
          "You're an efficient assistant specialized in providing concise and accurate legal information. Please note that I'm designed for legal queries only. If you have a legal question, feel free to ask. For non-legal queries, I may respond with 'This is not a legal query' and no further message",
      },
    ],
    max_tokens: 50,
  });

  return response;
};

openaiServices.createTranslation = async () => {
  const transcription = await openai.audio.translations.create({
    file: fs.createReadStream("./files/malayalam/common_voice_ml_38771214.mp3"),
    model: "whisper-1",
    response_format: "text",
  });

  return transcription;
};

openaiServices.storeChat = async (chatData) => {
  const { userId, promptId, prompt, response, responseId, chatId } = chatData;
  const promptData = { userId, chatId, promptId, prompt };
  const responseData = { userId, chatId, responseId, promptId, response };
  const conversationData = { userId, chatId };

  const newPrompt = new Prompt(promptData);
  const newResponse = new Response(responseData);
  const newConversation = new LawbotConversation(conversationData);

  await newPrompt.save();
  await newResponse.save();
  await newConversation.save();
  return newConversation;
};

openaiServices.findChat = async (chatId) => {
  const chat = await LawbotConversation.findOne({ chatId });
  return chat;
};

openaiServices.deleteChat = async (chatId) => {
  await Prompt.deleteMany({ chatId });

  // Delete response document associated with the chat
  await Response.deleteMany({ chatId });

  // Delete chat document
  await LawbotConversation.deleteOne({ chatId });
};

module.exports = openaiServices;
