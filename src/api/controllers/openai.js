//Libs,configs
const openai = require("../../config/openai");
const { v4: uuid } = require("uuid");
const multer = require("multer");

//Variables
const openaiController = {};
const upload = multer({ dest: "uploads/" });

//Helpers
const { HTTP_STATUS_CODES } = require("../helpers/statusCodes");
const JWT = require("../helpers/jwt");

//Services
const openaiServices = require("../services/openai");

openaiController.postResponse = async (req, res, next) => {
  try {
    const { chatId, prompt } = req.body;

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
    const newConversation = await openaiServices.storeChat(chatData);

    res.status(HTTP_STATUS_CODES.OK).json({
      response: response.choices[0].message.content,
      // chat: newConversation,
    });
  } catch (error) {
    next(error);
  }
};

// openaiController.transcribeAudio = async (req, res) => {
//   try {
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream("./files/english/harvard.wav"),
//       model: "whisper-1",
//       response_format: "text",
//     });

//     console.log(transcription);
//     res.status(200).json({ transcription: transcription });
//   } catch (error) {
//     console.log(error);
//   }
// };

(openaiController.translateAudio = upload.single("audioPrompt")),
  async (req, res, next) => {
    try {
      const audioPromptFilePath = req.file.path;
      const transcription = await openaiServices.createTranslation(
        audioPromptFilePath
      );
      const response = await openaiServices.createResponse(transcription);

      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ response: response.choices[0].message.content });
    } catch (error) {
      next(error);
    }
  };

openaiController.deleteChat = async (req, res, next) => {
  const { chatId } = req.params;
  try {
    const chat = await openaiServices.findChat(chatId);
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

module.exports = openaiController;
