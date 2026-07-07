import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sprintService } from "../services/sprintService";
import { ResponseHandler } from "../utils/apiResponse";

export class SprintController {
  async getSprints(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (workspaceId) {
        const list = await sprintService.getSprintsByWorkspace(workspaceId);
        return ResponseHandler.success(res, list, "Sprints retrieved for workspace.");
      }
      const list = await sprintService.getSprints();
      return ResponseHandler.success(res, list, "All sprints retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getSprintById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const sprint = await sprintService.getSprintById(id);
      if (!sprint) return ResponseHandler.error(res, "Sprint not found.", null, 404);
      return ResponseHandler.success(res, sprint, "Sprint retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { workspaceId, name, startDate, endDate } = req.body;
      if (!workspaceId || !name) return ResponseHandler.error(res, "Workspace ID and Name are required.", null, 400);
      const sprint = await sprintService.createSprint(workspaceId, name, startDate || new Date().toISOString(), endDate || new Date().toISOString());
      return ResponseHandler.success(res, sprint, "Sprint created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const sprint = await sprintService.updateSprint(id, req.body);
      if (!sprint) return ResponseHandler.error(res, "Sprint not found.", null, 404);
      return ResponseHandler.success(res, sprint, "Sprint updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async startSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const sprint = await sprintService.startSprint(id);
      if (!sprint) return ResponseHandler.error(res, "Sprint not found.", null, 404);
      return ResponseHandler.success(res, sprint, "Sprint started successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async completeSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const sprint = await sprintService.completeSprint(id);
      if (!sprint) return ResponseHandler.error(res, "Sprint not found.", null, 404);
      return ResponseHandler.success(res, sprint, "Sprint completed successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async deleteSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await sprintService.deleteSprint(id);
      if (!ok) return ResponseHandler.error(res, "Sprint not found.", null, 404);
      return ResponseHandler.success(res, null, "Sprint deleted successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const sprintController = new SprintController();
