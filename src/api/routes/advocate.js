//Libs
const express = require("express");
const router = express.Router();
const multer = require("multer");

//Variables
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/blogImage");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".png");
  },
});
const uploadBlogImage = multer({ storage: blogImageStorage });

const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/certificate");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".pdf");
  },
});
const uploadCertificate = multer({ storage: certificateStorage });

//Controllers
const advocateController = require("../controllers/advocate");

//Get
router.get("/verify", advocateController.verifyUser);

//Post
router.post(
  "/signup",
  uploadCertificate.single("enrollmentCertificate"),
  advocateController.signup
);
router.post("/signin", advocateController.signin);
router.post(
  "/postBlog",
  uploadBlogImage.single("image"),
  advocateController.postBlog
);
router.post("/deleteAccount", advocateController.deleteAccount);

//Put
router.put("/editBlog/:blogId", advocateController.editBlog);

module.exports = router;
