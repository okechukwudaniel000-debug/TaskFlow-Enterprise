import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.post("/mark-all-read", notificationController.markAllAsRead);
router.post("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.clearNotification);

export default router;
