//Libs
const bcrypt = require("bcrypt");

//Helpers
const HTTP_STATUS_CODES = require("./statusCodes");

//Variables
const hash = {};

hash.hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

hash.comparePassword = async (enteredPassword, userPassword) => {
  const isPasswordVerified = await bcrypt.compare(
    enteredPassword,
    userPassword
  );
  return isPasswordVerified;
};

module.exports = hash;
