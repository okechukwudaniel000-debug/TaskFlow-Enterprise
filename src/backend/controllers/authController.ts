import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { authService } from "../services/authService";
import { ResponseHandler } from "../utils/apiResponse";

export class AuthController {
  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email } = req.body;
      const user = await authService.authenticate(email);
      return ResponseHandler.success(res, user, "Successfully authenticated.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }
      return ResponseHandler.success(res, null, "Successfully logged out.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      return ResponseHandler.success(res, req.user || null, "Fetched user profile.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const updated = await authService.updateProfile(req.user.id, req.body);
      return ResponseHandler.success(res, updated, "Profile updated successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await authService.getAllUsers();
      return ResponseHandler.success(res, users, "Users fetched successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const authController = new AuthController();
