//Libs,Configs
const openai = require("../../config/openai");
const fs = require("fs");

//models
const LawbotConversation = require("../models/lawbot/lawbotConversation");
const Prompt = require("../models/lawbot/prompt");
const Response = require("../models/lawbot/response");
const openaiValidation = require("../validations/openai");

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

openaiServices.createTranslation = async (audioPromptFilePath) => {
  const transcription = await openai.audio.translations.create({
    file: fs.createReadStream(audioPromptFilePath),
    model: "whisper-1",
    response_format: "text",
  });

  return transcription;
};

openaiServices.storeChat = async (chat, chatData) => {
  const { userId, promptId, prompt, response, responseId, chatId } = chatData;
  const promptData = { userId, chatId, promptId, prompt };
  const responseData = { userId, chatId, responseId, promptId, response };
  // const conversationData = { userId, chatId };

  const newPrompt = new Prompt(promptData);
  const newResponse = new Response(responseData);
  // const newConversation = new LawbotConversation(conversationData);

  await newPrompt.save();
  await newResponse.save();

  chat.prompts.push(promptId);
  chat.responses.push(responseId);

  await LawbotConversation.findOneAndUpdate({ chatId: chatId }, chat); // await newConversation.save();
  // return newConversation;
  LawbotConversation.return;
};

openaiServices.createChat = async (chatData) => {
  const { userId, chatId } = chatData;
  const conversationData = {
    userId: userId,
    chatId: chatId,
    prompts: [],
    responses: [],
  };
  const newConversation = new LawbotConversation(conversationData);
  await newConversation.save();
  return;
};

openaiServices.deleteChat = async (chatId) => {
  await Prompt.deleteMany({ chatId });

  // Delete response document associated with the chat
  await Response.deleteMany({ chatId });

  // Delete chat document
  await LawbotConversation.deleteOne({ chatId });
};

openaiServices.getChat = async (chatId) => {
  const chat = await openaiValidation.checkIfChatExists(chatId);
  if (!chat) {
    return null;
  }

  const populatedChat = await LawbotConversation.aggregate([
    {
      $match: { chatId: chatId },
    },
    {
      $lookup: {
        from: "prompts",
        localField: "prompts",
        foreignField: "promptId",
        as: "prompts",
      },
    },
    {
      $lookup: {
        from: "responses",
        localField: "responses",
        foreignField: "responseId",
        as: "responses",
      },
    },
  ]);

  if (!populatedChat || populatedChat.length === 0) {
    return null;
  }

  // Extract the first (and only) document from the aggregation result
  const result = populatedChat[0];

  // console.log(result.prompts);

  result.prompts.sort((a, b) => a.timestamp - b.timestamp);
  result.responses.sort((a, b) => a.timestamp - b.timestamp);
  return result;
};

module.exports = openaiServices;
