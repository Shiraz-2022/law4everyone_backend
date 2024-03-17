const express = require("express");
const app = express();
const dotenv = require("dotenv");
const process = require("process");

const port = process.env.PORT || 3000;

dotenv.config();

//database
const db = require("./config/db");
db.on("error", () => console.log("MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB Atlas"));

//middleware
const addAuthToken = require("./api/middlewares/auth");
const cookieParser = require("cookie-parser");
const errorHandler = require("./api/middlewares/errorHandler");

//userRoutes
const userRoutes = require("./api/routes/user");
const openaiRoutes = require("./api/routes/openai");
const advocateRoutes = require("./api/routes/advocate");

//adminRoutes
const adminAdvocateRoutes = require("./api/routes/admin/advocate");

// Middleware registration
app.use(express.json());
app.use(cookieParser());
app.use(addAuthToken);

// Route registration
app.use("/user", userRoutes);
app.use("/lawbot", openaiRoutes);
app.use("/advocate", advocateRoutes);

//Admin
app.use("/admin/advocate", adminAdvocateRoutes);

// Error middleware registration
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log("Listening on port " + port);
});
