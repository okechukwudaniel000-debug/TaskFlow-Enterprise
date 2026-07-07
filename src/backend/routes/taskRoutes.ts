import { Router } from "express";
import { taskController } from "../controllers/taskController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

router.use(authMiddleware);

router.get("/", taskController.getTasks);
router.post("/", RequestValidator.validateBody(["title", "projectId", "workspaceId"]), taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.post("/:id/duplicate", taskController.duplicateTask);

// Comments
router.post("/:id/comments", RequestValidator.validateBody(["content"]), taskController.addComment);

// Subtasks
router.post("/:id/subtasks", RequestValidator.validateBody(["title"]), taskController.addSubtask);
router.post("/:id/subtasks/:subtaskId/toggle", taskController.toggleSubtask);

// Checklist items
router.post("/:id/checklist", RequestValidator.validateBody(["title"]), taskController.addChecklistItem);
router.post("/:id/checklist/:itemId/toggle", taskController.toggleChecklistItem);

// Attachments
router.post("/:id/attachments", RequestValidator.validateBody(["name", "size", "url"]), taskController.addAttachment);
router.delete("/:id/attachments/:attachmentId", taskController.removeAttachment);

// Enhanced lifecycle telemetry & sprints
router.post("/:id/time-logs", RequestValidator.validateBody(["durationMinutes"]), taskController.logTime);
router.post("/:id/watchers", taskController.addWatcher);
router.delete("/:id/watchers/:userId", taskController.removeWatcher);
router.post("/:id/dependencies", RequestValidator.validateBody(["dependsOnTaskId"]), taskController.addDependency);
router.delete("/:id/dependencies/:dependsOnTaskId", taskController.removeDependency);
router.post("/:id/sprint", taskController.linkSprint);

// Bulk ops
router.post("/bulk-update", RequestValidator.validateBody(["taskIds", "status"]), taskController.bulkUpdate);

export default router;
