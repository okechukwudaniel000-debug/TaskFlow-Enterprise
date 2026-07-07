import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import apiRouter from "./src/backend/routes";
import { errorMiddleware } from "./src/backend/middleware/errorMiddleware";
import { db } from "./src/backend/database/db";
import { backendEvents } from "./src/backend/events/eventEmitter";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express parser middlewares (Must precede routes)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount central REST API router
  app.use("/api", apiRouter);

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Global Express error handler
  app.use(errorMiddleware);

  // Create HTTP server for Node
  const server = http.createServer(app);

  // Initialize Socket.IO Server
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // 1. User A -> Socket Server -> Event Bus (backendEvents)
  io.on("connection", (socket) => {
    console.log(`[Socket Server] Client connected: ${socket.id}`);

    // Listen to task mutation events
    socket.on("task:mutate", (payload: { updatedTask: any }) => {
      if (payload && payload.updatedTask) {
        console.log(`[Socket Server] Received task:mutate from ${socket.id} for task ${payload.updatedTask.id}`);
        backendEvents.emit("task:mutate", {
          updatedTask: payload.updatedTask,
          senderSocketId: socket.id
        });
      }
    });

    // Listen to task deletion events
    socket.on("task:delete", (payload: { taskId: string }) => {
      if (payload && payload.taskId) {
        console.log(`[Socket Server] Received task:delete from ${socket.id} for task ${payload.taskId}`);
        backendEvents.emit("task:delete", {
          taskId: payload.taskId,
          senderSocketId: socket.id
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket Server] Client disconnected: ${socket.id}`);
    });
  });

  // 2. Event Bus (backendEvents) -> Socket Server -> User B
  backendEvents.on("task:mutate", (payload: { updatedTask: any; senderSocketId: string }) => {
    const { updatedTask, senderSocketId } = payload;
    console.log(`[Event Bus] Handling task:mutate from ${senderSocketId}. Syncing & broadcasting...`);

    // Asynchronously keep the JSON DB in perfect alignment
    try {
      const currentTasks = [...db.tasks];
      const index = currentTasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        currentTasks[index] = updatedTask;
        db.tasks = currentTasks;
      } else {
        currentTasks.unshift(updatedTask);
        db.tasks = currentTasks;
      }
    } catch (err) {
      console.error("[Event Bus DB Sync Error] Failed to write task to JSON db:", err);
    }

    // Broadcast update to other users
    io.emit("task:updated", {
      updatedTask,
      senderSocketId
    });
  });

  backendEvents.on("task:delete", (payload: { taskId: string; senderSocketId: string }) => {
    const { taskId, senderSocketId } = payload;
    console.log(`[Event Bus] Handling task:delete from ${senderSocketId}. Syncing & broadcasting...`);

    // Asynchronously remove from JSON database
    try {
      const currentTasks = [...db.tasks];
      const filtered = currentTasks.filter(t => t.id !== taskId);
      db.tasks = filtered;
    } catch (err) {
      console.error("[Event Bus DB Sync Error] Failed to delete task from JSON db:", err);
    }

    // Broadcast deletion to other users
    io.emit("task:deleted", {
      taskId,
      senderSocketId
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production server. Serving static files from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Development App URL: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot Enterprise SaaS Platform server:", err);
});
