import { io } from "socket.io-client";
import { useTaskStore } from "../features/tasks/taskStore";

// Connect to the same origin serving the applet
const socketUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export const socket = io(socketUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"]
});

export function initSocket() {
  socket.on("connect", () => {
    console.log("[Socket Client] Connected successfully with ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("[Socket Client] Disconnected from server");
  });

  // Listen to remote task updates
  socket.on("task:updated", (payload: { updatedTask: any; senderSocketId: string }) => {
    console.log("[Socket Client] Received remote task update:", payload);
    
    // Ignore if we were the sender
    if (payload.senderSocketId === socket.id) {
      return;
    }
    
    if (payload.updatedTask) {
      useTaskStore.getState().remoteSyncTask(payload.updatedTask);
    }
  });

  // Listen to remote task deletes
  socket.on("task:deleted", (payload: { taskId: string; senderSocketId: string }) => {
    console.log("[Socket Client] Received remote task deletion:", payload);
    
    if (payload.senderSocketId === socket.id) {
      return;
    }
    
    if (payload.taskId) {
      useTaskStore.getState().remoteDeleteTask(payload.taskId);
    }
  });
}
