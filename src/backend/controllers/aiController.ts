import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { aiService } from "../services/aiService";
import { taskRepository } from "../repositories/taskRepository";
import { userRepository } from "../repositories/userRepository";
import { ResponseHandler } from "../utils/apiResponse";

export class AIController {
  /**
   * Generates a descriptive, structured task markdown content based on title & notes
   */
  async generateDescription(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, notes } = req.body;
      if (!title) {
        return ResponseHandler.error(res, "Title is required to generate a task description.", null, 400);
      }

      const description = await aiService.generateDescription(title, notes);
      return ResponseHandler.success(res, { description }, "AI task description generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }

  /**
   * Breaks down a task's title/description into checklist subtask titles
   */
  async generateSubtasks(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description } = req.body;
      if (!title) {
        return ResponseHandler.error(res, "Task title is required to generate subtasks.", null, 400);
      }

      const subtasks = await aiService.generateSubtasks(title, description || "");
      return ResponseHandler.success(res, { subtasks }, "AI subtasks checklist generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }

  /**
   * Estimates effort in hours with structured rationale
   */
  async estimateEffort(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description } = req.body;
      if (!title) {
        return ResponseHandler.error(res, "Task title is required to estimate effort.", null, 400);
      }

      const estimation = await aiService.estimateEffort(title, description || "");
      return ResponseHandler.success(res, estimation, "AI effort estimate generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }

  /**
   * Recommends priority level with supportive reasoning
   */
  async suggestPriority(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, dueDate } = req.body;
      if (!title) {
        return ResponseHandler.error(res, "Task title is required to suggest priority.", null, 400);
      }

      const recommendation = await aiService.suggestPriority(title, description || "", dueDate);
      return ResponseHandler.success(res, recommendation, "AI priority recommendation generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }

  /**
   * Summarizes comments and active discussion consensus of a task
   */
  async summarizeDiscussions(req: AuthenticatedRequest, res: Response) {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        return ResponseHandler.error(res, "taskId is required to summarize discussions.", null, 400);
      }

      const task = await taskRepository.getById(taskId);
      if (!task) {
        return ResponseHandler.error(res, "Task not found.", null, 404);
      }

      const commentsText = await Promise.all((task.comments || []).map(async c => {
        const u = await userRepository.getById(c.userId);
        return `${u ? u.name : "User"}: ${c.content}`;
      }));
      const summary = await aiService.summarizeComments(commentsText);
      return ResponseHandler.success(res, { summary }, "AI discussion summary generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }

  /**
   * Evaluates team productivity and generates insights/risks/suggestions
   */
  async generateProductivityInsights(req: AuthenticatedRequest, res: Response) {
    try {
      const { workspaceId } = req.body;
      if (!workspaceId) {
        return ResponseHandler.error(res, "workspaceId is required for productivity insights.", null, 400);
      }

      // Fetch active, non-archived tasks in the target workspace
      const allTasks = await taskRepository.getAll();
      const workspaceTasks = allTasks.filter(t => t.workspaceId === workspaceId && !t.isArchived);

      // Fetch users for workload context
      const users = await userRepository.getAll();

      const insights = await aiService.generateProductivityInsights(workspaceTasks, users);
      return ResponseHandler.success(res, insights, "AI productivity insights generated successfully.");
    } catch (e: any) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const aiController = new AIController();
