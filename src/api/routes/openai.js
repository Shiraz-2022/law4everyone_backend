//Libs
const express = require("express");
const router = express.Router();

//Controllers
const openaiController = require("../controllers/openai");

//post
router.post("/getResponse", openaiController.postResponse);
router.post("/convertAudio", openaiController.translateAudio);

//delete
router.delete("/deleteChat/:chatId", openaiController.deleteChat);

module.exports = router;
