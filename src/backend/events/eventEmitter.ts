import { EventEmitter } from "events";
import { db } from "../database/db";
import { ActivityAction, ActivityLog, Notification } from "../../types";

class BackendEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  private setupListeners() {
    // Log user activities to database asynchronously
    this.on("activity", async (logData: Omit<ActivityLog, "id" | "createdAt">) => {
      try {
        const newLog: ActivityLog = {
          ...logData,
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date().toISOString()
        };

        const currentTasks = [...db.tasks];
        const taskIndex = currentTasks.findIndex(t => t.id === logData.taskId);
        if (taskIndex !== -1) {
          const task = currentTasks[taskIndex];
          const activityTimeline = [...(task.activityTimeline || []), newLog];
          currentTasks[taskIndex] = { ...task, activityTimeline, updatedAt: new Date().toISOString() };
          db.tasks = currentTasks;
        }
      } catch (e) {
        console.error("Failed to log activity event:", e);
      }
    });

    // Handle automated system notification generation
    this.on("notification", async (notifData: Omit<Notification, "id" | "isRead" | "createdAt">) => {
      try {
        const newNotif: Notification = {
          ...notifData,
          id: `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        db.notifications = [newNotif, ...db.notifications];
        console.log(`[Notification Dispatch] Sent to ${notifData.userId}: ${notifData.title}`);
      } catch (e) {
        console.error("Failed to create system notification event:", e);
      }
    });
  }

  public logActivity(taskId: string, userId: string, action: ActivityAction, details: string) {
    this.emit("activity", { taskId, userId, action, details });
  }

  public sendNotification(userId: string, title: string, description: string, type: string) {
    this.emit("notification", { userId, title, description, type });
  }
}

export const backendEvents = new BackendEventEmitter();
