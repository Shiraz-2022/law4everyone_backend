//Libs
const express = require("express");
const router = express.Router();
const multer = require("multer");

//Variables
const signupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/advocate");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadSignup = multer({ storage: signupStorage });

//Controllers
const advocateController = require("../controllers/advocate");

//Get
router.get("/verify", advocateController.verifyUser);
router.get("/getProfileDetails", advocateController.getProfileDetails);
router.get("/getProblems", advocateController.getProblems);

//Post
router.post(
  "/signup",
  uploadSignup.array("files", 2),
  advocateController.signup
);
router.post("/signin", advocateController.signin);
router.post(
  "/postBlog",
  uploadSignup.single("image"),
  advocateController.postBlog
);
router.post("/deleteAccount", advocateController.deleteAccount);
router.post("/sendCaseAcceptRequest", advocateController.sendCaseAcceptRequest);
router.post("/likeOrUnlikeBlog", advocateController.likeOrUnlikeBlog);
router.post("/commentOnBlog", advocateController.commentOnBlog);

//Put
router.put("/editBlog", advocateController.editBlog);

module.exports = router;
