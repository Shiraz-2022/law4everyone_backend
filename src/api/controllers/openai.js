//Libs,configs
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");

//Variables
const openaiController = {};

//Helpers
const { HTTP_STATUS_CODES } = require("../helpers/statusCodes");
const JWT = require("../helpers/jwt");

//Services
const openaiServices = require("../services/openai");

//Validations
const openaiValidation = require("../validations/openai");

openaiController.postResponse = async (req, res, next) => {
  try {
    const { chatId, prompt } = req.body;
    const chat = await openaiValidation.checkIfChatExists(chatId);
    if (!chat) {
      return res
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: "Please create a chat first" });
    }

    const decodedToken = await JWT.checkJwtStatus(req);
    const response = await openaiServices.createResponse(prompt);

    const chatData = {
      userId: decodedToken.userId,
      chatId: chatId,
      promptId: uuid(),
      responseId: uuid(),
      prompt: prompt,
      response: response.choices[0].message.content,
    };
    await openaiServices.storeChat(chat, chatData);

    res.status(HTTP_STATUS_CODES.OK).json({
      response: response.choices[0].message.content,
      // chat: newConversation,
    });
  } catch (error) {
    next(error);
  }
};

openaiController.translateAudio = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    if (!req.file) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ error: "No audio file uploaded" });
    }

    const chat = await openaiValidation.checkIfChatExists(chatId);
    if (!chat) {
      return res
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: "Please create a chat first" });
    }

    const decodedToken = await JWT.checkJwtStatus(req);

    const audioPromptFilePath = path.resolve(req.file.path);
    const audioBuffer = fs.readFileSync(audioPromptFilePath);

    const transcription = await openaiServices.createTranslation(
      audioPromptFilePath
    );
    const response = await openaiServices.createResponse(transcription);

    const chatData = {
      userId: decodedToken.userId,
      chatId: chatId,
      promptId: uuid(),
      responseId: uuid(),
      prompt: audioBuffer,
      response: response.choices[0].message.content,
    };
    await openaiServices.storeChat(chat, chatData);

    fs.unlinkSync(audioPromptFilePath);

    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ response: response.choices[0].message.content });
  } catch (error) {
    next(error);
  }
};

openaiController.createChat = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    // const chatId = 1;
    const decodedToken = await JWT.checkJwtStatus(req);
    const chatData = { userId: decodedToken.userId, chatId: chatId };
    await openaiServices.createChat(chatData);
    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: "Chat has been created succesfully" });
  } catch (error) {
    next(error);
  }
};

openaiController.deleteChat = async (req, res, next) => {
  const { chatId } = req.params;
  try {
    const chat = await openaiValidation.checkIfChatExists(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    await openaiServices.deleteChat(chatId);
    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: `Chat with id ${chatId} has been deleted succesfully` });
  } catch (error) {
    next(error);
  }
};

openaiController.getChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await openaiServices.getChat(chatId);
    if (!chat) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ message: `Chat with chat id ${chatId} does not exists ` });
    }
    const { prompts, responses } = chat;
    res.status(HTTP_STATUS_CODES.OK).json({
      message: "Prompts and responses fetched succesfully",
      prompts,
      responses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = openaiController;
