import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { projectService } from "../services/projectService";
import { ResponseHandler } from "../utils/apiResponse";

export class ProjectController {
  async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await projectService.getProjects();
      return ResponseHandler.success(res, list, "Projects retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, color, icon, template, workspaceId } = req.body;
      const proj = await projectService.createProject(
        name,
        description || "",
        color || "#3B82F6",
        icon || "Folder",
        template || "kanban",
        workspaceId
      );
      return ResponseHandler.success(res, proj, "Project created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const proj = await projectService.updateProject(id, req.body);
      if (!proj) return ResponseHandler.error(res, "Project not found.", null, 404);
      return ResponseHandler.success(res, proj, "Project updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const proj = await projectService.toggleFavorite(id);
      if (!proj) return ResponseHandler.error(res, "Project not found.", null, 404);
      return ResponseHandler.success(res, proj, "Project favorite state toggled.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async archiveProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const proj = await projectService.archiveProject(id);
      if (!proj) return ResponseHandler.error(res, "Project not found.", null, 404);
      return ResponseHandler.success(res, proj, "Project archived successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async duplicateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const proj = await projectService.duplicateProject(id);
      if (!proj) return ResponseHandler.error(res, "Project not found.", null, 404);
      return ResponseHandler.success(res, proj, "Project duplicated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const projectController = new ProjectController();
