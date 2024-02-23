//Helpers
const { HTTP_STATUS_MESSAGES } = require("../helpers/statusCodes");

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;

  if (err.name === "ValidationError") {
    statusCode = 400; // Bad request for validation errors
  } else if (err.name === "AuthenticationError") {
    statusCode = 401; // Unauthorized for authentication errors
  } else if (err.name === "AuthorizationError") {
    statusCode = 403; // Forbidden for authorization errors
  }

  // console.log(err);
  res.status(statusCode).json({
    message: HTTP_STATUS_MESSAGES[statusCode],
    error: {
      title: err.name,
      description: err.message,
    },
  });
  // res.status(500).json({ error: err.name });
};

module.exports = errorHandler;
