import { db } from "../database/db";
import { Notification } from "../../types";

export class NotificationRepository {
  async getAll(): Promise<Notification[]> {
    return db.notifications;
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    return db.notifications.filter(n => n.userId === userId);
  }

  async create(notification: Notification): Promise<Notification> {
    const updated = [notification, ...db.notifications];
    db.notifications = updated;
    return notification;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notifications = db.notifications;
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return null;

    const updated = { ...notifications[index], isRead: true };
    const updatedNotifications = [...notifications];
    updatedNotifications[index] = updated;
    db.notifications = updatedNotifications;

    return updated;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const notifications = db.notifications;
    const updated = notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    db.notifications = updated;
    return true;
  }

  async clear(id: string): Promise<boolean> {
    const notifications = db.notifications;
    const beforeLength = notifications.length;
    const filtered = notifications.filter(n => n.id !== id);
    db.notifications = filtered;
    return filtered.length < beforeLength;
  }
}

export const notificationRepository = new NotificationRepository();
