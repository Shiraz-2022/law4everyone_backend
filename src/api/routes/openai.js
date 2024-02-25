//Libs
const express = require("express");
const router = express.Router();
const multer = require("multer");

//Variables
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/audioPrompt");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".wav");
  },
});
const upload = multer({ storage: storage });

//Controllers
const openaiController = require("../controllers/openai");

//get
router.get("/getChat/:chatId", openaiController.getChat);

//post
router.post("/createChat", openaiController.createChat);
router.post("/getResponse", openaiController.postResponse);
router.post(
  "/convertAudio",
  upload.single("audioPrompt"),
  openaiController.translateAudio
);

//delete
router.delete("/deleteChat/:chatId", openaiController.deleteChat);

module.exports = router;
