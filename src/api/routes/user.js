const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

//get
router.get("/verify", userController.verifyUser);

//post
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.post("/signout", userController.signout);
router.post("/isUserVerified", userController.checkEmailIsVerified);
router.post("/postProblem", userController.postProblem);

module.exports = router;
