import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { automationRuleService } from "../services/automationRuleService";
import { ResponseHandler } from "../utils/apiResponse";

export class AutomationRuleController {
  async getRules(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (workspaceId) {
        const list = await automationRuleService.getRulesByWorkspace(workspaceId);
        return ResponseHandler.success(res, list, "Rules retrieved for workspace.");
      }
      const list = await automationRuleService.getRules();
      return ResponseHandler.success(res, list, "All automation rules retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getRuleById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const rule = await automationRuleService.getRuleById(id);
      if (!rule) return ResponseHandler.error(res, "Rule not found.", null, 404);
      return ResponseHandler.success(res, rule, "Automation rule retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { workspaceId, name, trigger, triggerValue, action, actionValue } = req.body;
      if (!workspaceId || !name || !trigger || !action) {
        return ResponseHandler.error(res, "Workspace ID, Name, Trigger, and Action are required.", null, 400);
      }
      const rule = await automationRuleService.createRule(workspaceId, name, trigger, triggerValue, action, actionValue);
      return ResponseHandler.success(res, rule, "Automation rule created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const rule = await automationRuleService.updateRule(id, req.body);
      if (!rule) return ResponseHandler.error(res, "Rule not found.", null, 404);
      return ResponseHandler.success(res, rule, "Automation rule updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async deleteRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await automationRuleService.deleteRule(id);
      if (!ok) return ResponseHandler.error(res, "Rule not found.", null, 404);
      return ResponseHandler.success(res, null, "Automation rule deleted successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const automationRuleController = new AutomationRuleController();
