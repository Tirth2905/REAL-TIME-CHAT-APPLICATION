const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// In-memory store
let messages = [];  // { id, text, senderId, senderName, timestamp, edited }
let users = {};     // socketId -> { id, name }

function broadcastUsers() {
  io.emit("users", Object.values(users));
}

function broadcastMessages() {
  io.emit("messages", messages);
}

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // Send current state to new user
  socket.emit("messages", messages);
  socket.emit("users", Object.values(users));

  // A user sets their name
  socket.on("set_name", (name) => {
    users[socket.id] = { id: socket.id, name: name.trim().slice(0, 24) };
    broadcastUsers();
    // System message
    messages.push({
      id: `sys_${Date.now()}`,
      type: "system",
      text: `${users[socket.id].name} joined`,
      timestamp: Date.now(),
    });
    broadcastMessages();
  });

  // Add a person by name (creates a "ghost" user slot others can see)
  socket.on("add_person", (name) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    // Just broadcast a system message — the person needs to join themselves
    // But we show them in a pending list
    io.emit("person_invited", { name: trimmed, by: users[socket.id]?.name });
  });

  // Send message
  socket.on("send_message", (text) => {
    const user = users[socket.id];
    if (!user || !text.trim()) return;
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "message",
      text: text.trim().slice(0, 1000),
      senderId: socket.id,
      senderName: user.name,
      timestamp: Date.now(),
      edited: false,
    };
    messages.push(msg);
    broadcastMessages();
  });

  // Edit message (only sender can)
  socket.on("edit_message", ({ messageId, newText }) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.senderId !== socket.id) return;
    msg.text = newText.trim().slice(0, 1000);
    msg.edited = true;
    broadcastMessages();
  });

  // Delete message (only sender can)
  socket.on("delete_message", (messageId) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.senderId !== socket.id) return;
    messages = messages.filter((m) => m.id !== messageId);
    broadcastMessages();
  });

  // Typing
  socket.on("typing", (isTyping) => {
    const user = users[socket.id];
    if (!user) return;
    socket.broadcast.emit("typing", { id: socket.id, name: user.name, isTyping });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      messages.push({
        id: `sys_${Date.now()}`,
        type: "system",
        text: `${user.name} left`,
        timestamp: Date.now(),
      });
      delete users[socket.id];
      broadcastUsers();
      broadcastMessages();
    }
  });
});

app.get("/", (req, res) => res.send("Chat server running"));

const PORT = 3001;
server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
