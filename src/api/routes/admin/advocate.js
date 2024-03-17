//Libs
const express = require("express");
const router = express.Router();

//Controllers
const advocateController = require("../../controllers/admin/advocate");

//Post

router.post(
  "/verifyAdvocate",
  advocateController.updateAdvocateVerficationStatus
);

module.exports = router;
