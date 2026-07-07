import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { notificationService } from "../services/notificationService";
import { ResponseHandler } from "../utils/apiResponse";

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const list = await notificationService.getNotifications(req.user.id);
      return ResponseHandler.success(res, list, "Notifications retrieved successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const notif = await notificationService.markAsRead(id);
      if (!notif) return ResponseHandler.error(res, "Notification not found.", null, 404);
      return ResponseHandler.success(res, notif, "Notification marked as read.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      await notificationService.markAllAsRead(req.user.id);
      return ResponseHandler.success(res, null, "All notifications marked as read.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async clearNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await notificationService.clearNotification(id);
      if (!ok) return ResponseHandler.error(res, "Notification not found.", null, 404);
      return ResponseHandler.success(res, null, "Notification cleared.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const notificationController = new NotificationController();
