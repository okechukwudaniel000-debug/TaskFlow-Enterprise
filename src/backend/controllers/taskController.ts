import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { taskService } from "../services/taskService";
import { ResponseHandler } from "../utils/apiResponse";

export class TaskController {
  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await taskService.getTasks();
      return ResponseHandler.success(res, list, "Tasks retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const task = await taskService.createTask(req.body, req.user.id);
      return ResponseHandler.success(res, task, "Task created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id } = req.params;
      const task = await taskService.updateTask(id, req.body, req.user.id);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Task updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await taskService.deleteTask(id);
      if (!ok) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, null, "Task deleted successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async duplicateTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id } = req.params;
      const task = await taskService.duplicateTask(id, req.user.id);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Task duplicated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id } = req.params;
      const { content } = req.body;
      const task = await taskService.addComment(id, content, req.user.id);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Comment added successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async toggleSubtask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id, subtaskId } = req.params;
      const task = await taskService.toggleSubtask(id, subtaskId, req.user.id);
      if (!task) return ResponseHandler.error(res, "Task or subtask not found.", null, 404);
      return ResponseHandler.success(res, task, "Subtask status toggled successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async toggleChecklistItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id, itemId } = req.params;
      const task = await taskService.toggleChecklistItem(id, itemId, req.user.id);
      if (!task) return ResponseHandler.error(res, "Task or checklist item not found.", null, 404);
      return ResponseHandler.success(res, task, "Checklist item status toggled.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addSubtask(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const task = await taskService.addSubtask(id, title);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Subtask added successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addChecklistItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const task = await taskService.addChecklistItem(id, title);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Checklist item added.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addAttachment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, size, url } = req.body;
      const task = await taskService.addAttachment(id, name, size, url);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Attachment uploaded.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async removeAttachment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, attachmentId } = req.params;
      const task = await taskService.removeAttachment(id, attachmentId);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Attachment removed.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async bulkUpdate(req: AuthenticatedRequest, res: Response) {
    try {
      const { taskIds, status } = req.body;
      const list = await taskService.bulkUpdate(taskIds, status);
      return ResponseHandler.success(res, list, "Bulk status update completed.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async logTime(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id } = req.params;
      const { durationMinutes, description } = req.body;
      if (!durationMinutes || isNaN(Number(durationMinutes))) {
        return ResponseHandler.error(res, "Invalid duration in minutes.", null, 400);
      }
      const task = await taskService.logTime(id, req.user.id, parseInt(durationMinutes), description);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Time logged successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addWatcher(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id } = req.params;
      const { userId } = req.body;
      const task = await taskService.addWatcher(id, userId || req.user.id);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Watcher added successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async removeWatcher(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { id, userId } = req.params;
      const task = await taskService.removeWatcher(id, userId || req.user.id);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Watcher removed successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async addDependency(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { dependsOnTaskId } = req.body;
      const task = await taskService.addDependency(id, dependsOnTaskId);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Dependency added successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async removeDependency(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, dependsOnTaskId } = req.params;
      const task = await taskService.removeDependency(id, dependsOnTaskId);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Dependency removed successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async linkSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { sprintId } = req.body;
      const task = await taskService.linkSprint(id, sprintId || null);
      if (!task) return ResponseHandler.error(res, "Task not found.", null, 404);
      return ResponseHandler.success(res, task, "Sprint link updated.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const taskController = new TaskController();
