//Libs
const express = require("express");
const router = express.Router();
const multer = require("multer");

//Variables
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/enrollmentCertificate");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".pdf");
  },
});
const upload = multer({ storage: storage });

//Controllers
const advocateController = require("../controllers/advocate");

//Get
router.get("/verify", advocateController.verifyUser);

//Post
router.post(
  "/signup",
  upload.single("enrollmentCertificate"),
  advocateController.signup
);

router.post("/signin", advocateController.signin);

module.exports = router;
