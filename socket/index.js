import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
    console.log(`${username} connected with socket ID: ${socket.id}`);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    if (receiver) {  // Check if the receiver exists
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        type,
      });
    } else {
      console.log(`User ${receiverName} not found`);
    }
  });

  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    if (receiver) {  // Check if the receiver exists
      io.to(receiver.socketId).emit("getText", {
        senderName,
        text,
      });
    } else {
      console.log(`User ${receiverName} not found`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`User with socket ID: ${socket.id} disconnected`);
  });
});

io.listen(5000);
