import { notificationRepository } from "../repositories/notificationRepository";
import { Notification } from "../../types";

export class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    return await notificationRepository.getByUserId(userId);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return await notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    return await notificationRepository.markAllAsRead(userId);
  }

  async clearNotification(id: string): Promise<boolean> {
    return await notificationRepository.clear(id);
  }
}

export const notificationService = new NotificationService();
