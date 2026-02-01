import express from "express";
import { Server } from "socket.io";
import Connection from "./db/db.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { router as userRoutes } from "./routes/userRoutes.js";
import { router as chatRoutes } from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import upload from "./utils/upload.js";
import { UploadImage, getImage } from "./controllers/imageControllers.js";
import { Message } from "./models/messageModels.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.post("/file/upload", upload.single("file"), UploadImage);
app.get("/file/:filename", getImage);

app.get("/", (req, res) => {
  res.send("ChatterNet Backend is running");
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const GuestUsersInRooms = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomID) => {
    if (!roomID) return;
    socket.join(roomID);
    io.to(roomID).emit("user:joined", { id: socket.id });
    console.log(`user joined ${roomID}`);
  });

  socket.on("leave chat", (roomId) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on("togglePinMessage", async ({ messageId, chatId }) => {
    try {
      if (!messageId || !chatId) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      // UNPIN
      if (message.isPinned) {
        message.isPinned = false;
        await message.save();

        io.to(chatId).emit("messagePinUpdated", {
          messageId,
          isPinned: false,
        });
        return;
      }

      // UNPIN ALL OTHERS
      await Message.updateMany(
        { chat: chatId },
        { isPinned: false }
      );

      // PIN CURRENT
      message.isPinned = true;
      await message.save();

      io.to(chatId).emit("messagePinUpdated", {
        messageId,
        isPinned: true,
      });
    } catch (err) {
      console.error("Toggle pin error:", err);
    }
  });

  socket.on("typing", (roomId) => {
    if (!roomId) return;
    socket.in(roomId).emit("typing");
  });

  socket.on("stop typing", (roomId) => {
    if (!roomId) return;
    socket.in(roomId).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived?.chat;
    if (!chat || !Array.isArray(chat.users)) return;

    socket.to(chat._id).emit("message received", newMessageReceived);
  });

  socket.on("join as guest", (room, name) => {
    if (!room || !name) return;

    socket.join(room);
    if (!GuestUsersInRooms[room]) {
      GuestUsersInRooms[room] = [];
    }

    GuestUsersInRooms[room].push({ id: socket.id, name });
    io.to(room).emit("update users", GuestUsersInRooms[room]);
    io.to(room).emit("latest user", name);
  });

  socket.on("send_message", (data) => {
    if (!data?.room) return;
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    if (!to || !offer) return;
    socket.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    if (!to || !ans) return;
    socket.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("call:declined", ({ to }) => {
    if (!to) return;
    socket.to(to).emit("call:declined", {
      from: socket.id,
      msg: "Call declined by the user",
    });
  });

  socket.on("peer:nego:needed", ({ offer, to }) => {
    if (!offer || !to) return;
    socket.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    if (!to || !ans) return;
    socket.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("leave group", ({ name, roomID }) => {
    try {
      if (!roomID || !GuestUsersInRooms[roomID]) return;

      GuestUsersInRooms[roomID] = GuestUsersInRooms[roomID].filter(
        (u) => u.name !== name
      );

      io.to(roomID).emit("update users", GuestUsersInRooms[roomID]);
      io.to(roomID).emit("user leaved", name);
    } catch (err) {
      console.error("leave group error:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const room in GuestUsersInRooms) {
      GuestUsersInRooms[room] = GuestUsersInRooms[room].filter(
        (u) => u.id !== socket.id
      );
      io.to(room).emit("update users", GuestUsersInRooms[room]);
    }
    console.log("User Disconnected:", socket.id);
  });
});

Connection();
