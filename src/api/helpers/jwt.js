//Libs
const jwt = require("jsonwebtoken");
const process = require("process");

//Variables
const JWT = {};

JWT.generateAndStoreJwtUser = async (user) => {
  const token = jwt.sign(
    { userId: user.userId, name: user.name, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: 15 * 24 * 60 * 60,
    }
  );
  // res.cookie("userAuthToken", token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  //   domain: "localhost",
  //   path: "/",
  // });
  // console.log("jwt token" + token);
  return token;
};

JWT.generateAndStoreJwtAdvocate = async (advocate) => {
  const token = jwt.sign(
    {
      advocateId: advocate.advocateId,
      name: advocate.name,
      email: advocate.email,
    },
    process.env.JWT_SECRET_KEY
    // {
    //   expiresIn: 15 * 24 * 60 * 60,
    // }
  );
  // res.cookie("userAuthToken", token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  //   domain: "localhost",
  //   path: "/",
  // });
  // console.log("jwt token" + token);
  return token;
};

JWT.checkJwtStatus = async (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    // return res.status(401).json({ error: "Unauthorized - Missing Token" });
    return null;
  }
  const token = authHeader.split(" ")[1]; // Assuming the format is "Bearer <token>"
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  return decodedToken;
};

module.exports = JWT;
