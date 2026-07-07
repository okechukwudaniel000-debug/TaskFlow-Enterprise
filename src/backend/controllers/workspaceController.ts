import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { workspaceService } from "../services/workspaceService";
import { ResponseHandler } from "../utils/apiResponse";

export class WorkspaceController {
  async getWorkspaces(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await workspaceService.getWorkspaces();
      return ResponseHandler.success(res, list, "Workspaces retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createWorkspace(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { name, description } = req.body;
      const ws = await workspaceService.createWorkspace(name, description || "", req.user.id);
      return ResponseHandler.success(res, ws, "Workspace created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateWorkspace(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const ws = await workspaceService.updateWorkspace(id, name, description || "");
      if (!ws) return ResponseHandler.error(res, "Workspace not found.", null, 404);
      return ResponseHandler.success(res, ws, "Workspace updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async deleteWorkspace(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await workspaceService.deleteWorkspace(id);
      if (!ok) return ResponseHandler.error(res, "Workspace not found.", null, 404);
      return ResponseHandler.success(res, null, "Workspace deleted successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Workspace ID
      const { email, role } = req.body;
      const ws = await workspaceService.inviteMember(id, email, role);
      if (!ws) return ResponseHandler.error(res, "Workspace not found.", null, 404);
      return ResponseHandler.success(res, ws, "Workspace member invited successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, userId } = req.params;
      const ws = await workspaceService.removeMember(id, userId);
      if (!ws) return ResponseHandler.error(res, "Workspace not found.", null, 404);
      return ResponseHandler.success(res, ws, "Workspace member removed successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const workspaceController = new WorkspaceController();
