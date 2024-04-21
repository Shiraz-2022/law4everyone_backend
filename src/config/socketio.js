//Libs
const socketIO = require("socket.io");

//Services
const userService = require("../api/services/user");
const advocateService = require("../api/services/advocate");

let io;

const initializeSocketServer = (server) => {
  io = socketIO(server);

  io.on("connection", async function (socket) {
    const { userId, userType, advocateId } = socket.handshake.query;

    if (userType == "user") {
      const updatedUser = await userService.storeSocketId(userId, socket.id);
      console.log("A user connected.");
    }
    if (userType == "advocate") {
      const updatedAdvocate = await advocateService.storeSocketId(
        advocateId,
        socket.id
      );
      console.log("An advocate connected.");
    }

    // Handle disconnection
    socket.on("disconnect", function () {
      console.log("Client disconnected.");
    });
  });
};

const getIoInstance = () => {
  if (!io) {
    throw new Error("Socket.IO instance not initialized");
  }
  return io;
};

module.exports = { initializeSocketServer, getIoInstance };
