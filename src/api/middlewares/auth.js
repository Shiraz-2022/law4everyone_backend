//Helpers
const JWT = require("../helpers/jwt");

const publicPaths = [
  //User

  "/user/signup",
  "/user/verify",
  "/user/signin",
  "/user/isUserVerified",

  //Advocate

  "/advocate/signup",
  "/advocate/signin",
  "/advocate/isUserVerified",
  "/advocate/verify",
];

const addAuthToken = async (req, res, next) => {
  try {
    if (publicPaths.includes(req.path) || req.path.includes("/admin")) {
      next();
    } else if (req.path == "/") {
      res.status(200).json({ message: "This is law4everyone backend" });
    } else {
      const decodedToken = await JWT.checkJwtStatus(req);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      if (decodedToken != null) {
        if (decodedToken.exp < currentTimeInSeconds) {
          res.status(403).json({ message: "Token has expired" });
        }
        // req.headers.authorization = `Bearer ${decodedToken}`;
        next();
      } else {
        res.status(401).json({ error: "Unauthorized - Missing Token" });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = addAuthToken;
