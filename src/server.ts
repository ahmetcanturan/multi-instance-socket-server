import "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Redis } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import path from "path";

const app = express();
const httpServer = createServer(app);

// Environment variables
const PORT = process.env.PORT || 3000;
const redisHost = process.env.REDIS_HOST;
console.log(redisHost);
const redisPort = process.env.REDIS_PORT || 6379;
const useRedisAdapter = process.env.USE_REDIS_ADAPTER === "true";
const pubClient = new Redis({ host: redisHost, port: Number(redisPort) });
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  adapter: useRedisAdapter ? createAdapter(pubClient, subClient) : undefined,
});

app.use(express.static(path.join(__dirname, "..")));
app.use(express.static(__dirname));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client.html"));
});

// Redis status endpoint
app.get("/redis-status", (req, res) => {
  res.json({ useRedis: useRedisAdapter });
});

// Common message
app.post("/common-message", (req, res) => {
  try {
    const message = req.body.message;
    console.log("Admin message received:", message);
    io.emit("message", {
      message,
    });
    return res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).send("Failed to send message");
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  const clientId = socket.id.substring(0, 6);
  console.log(`Client connected: ${clientId}`);
  socket.on("message", (data) => {
    console.log(`Admin message received from ${clientId}:`, data);
  });
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${clientId}`);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`
        Server running on port: ${PORT}
        Redis Adapter: ${useRedisAdapter ? "Enabled" : "Disabled"}
        `);
});
