const mongoose = require("mongoose");

const password = encodeURIComponent("7TACxQM8U7RQE7ef");
const mongoUrl = `mongodb+srv://shiraz:${password}@law4everyonecluster.mb609.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(mongoUrl);
const db = mongoose.connection;

module.exports = db;
