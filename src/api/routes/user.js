//Libs
const express = require("express");
const router = express.Router();

const multer = require("multer");

//Controllers
const userController = require("../controllers/user");

//Variables
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/user");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Get
router.get("/verify", userController.verifyUser);
router.get("/getBlogs", userController.getBlogs);
router.get(
  "/searchAdvocateByUserName",
  userController.searchAdvocateByUserName
);
router.get("/searchAdvocateByName", userController.searchAdvocateByName);
router.get("/getProblems", userController.getProblems);
router.get("/getUserProfile", userController.getUserProfile);
router.get("/nearByAdvocates", userController.nearbyAdvocates);
router.get("/searchByLocation", userController.searchByLocation);

//Post
router.post("/signup", upload.single("profileImage"), userController.signup);
router.post("/signin", userController.signin);
router.post("/signout", userController.signout);
router.post("/isUserVerified", userController.checkEmailIsVerified);
router.post("/postProblem", userController.postProblem);
router.post("/commentOnBlog", userController.commentOnBlog);
router.post("/likeOrUnlikeBlog", userController.likeOrUnlikeBlog);
//Put
router.put("/editProblem/:problemId", userController.editProblem);

//delete
router.delete("/deleteProblem", userController.deleteProblem);

module.exports = router;
