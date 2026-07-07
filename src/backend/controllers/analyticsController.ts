import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { analyticsService } from "../services/analyticsService";
import { ResponseHandler } from "../utils/apiResponse";

export class AnalyticsController {
  async getWorkspaceAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { workspaceId } = req.params;
      if (!workspaceId) {
        return ResponseHandler.error(res, "workspaceId is required", null, 400);
      }

      const metrics = await analyticsService.getWorkspaceMetrics(workspaceId);
      return ResponseHandler.success(res, metrics, "Workspace analytics fetched successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const analyticsController = new AnalyticsController();
