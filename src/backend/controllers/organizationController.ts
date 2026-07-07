import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { organizationService } from "../services/organizationService";
import { ResponseHandler } from "../utils/apiResponse";

export class OrganizationController {
  async getOrganizations(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await organizationService.getOrganizations();
      return ResponseHandler.success(res, list, "Organizations retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getOrganizationById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const org = await organizationService.getOrganizationById(id);
      if (!org) return ResponseHandler.error(res, "Organization not found.", null, 404);
      return ResponseHandler.success(res, org, "Organization retrieved.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async createOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, subscriptionPlan } = req.body;
      if (!name) return ResponseHandler.error(res, "Name is required.", null, 400);
      const org = await organizationService.createOrganization(name, subscriptionPlan || "Free");
      return ResponseHandler.success(res, org, "Organization created successfully.", 201);
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const org = await organizationService.updateOrganization(id, req.body);
      if (!org) return ResponseHandler.error(res, "Organization not found.", null, 404);
      return ResponseHandler.success(res, org, "Organization updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async deleteOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await organizationService.deleteOrganization(id);
      if (!ok) return ResponseHandler.error(res, "Organization not found.", null, 404);
      return ResponseHandler.success(res, null, "Organization deleted successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const organizationController = new OrganizationController();
