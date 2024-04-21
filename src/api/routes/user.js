const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

//Get
router.get("/verify", userController.verifyUser);
router.get("/getBlogs", userController.getBlogs);
router.get("/searchAdvocate", userController.searchAdvocate);
router.get("/getProblems", userController.getProblems);

//Post
router.post("/signup", userController.signup);
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
