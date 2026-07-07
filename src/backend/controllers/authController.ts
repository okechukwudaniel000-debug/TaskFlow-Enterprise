import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { authService } from "../services/authService";
import { ResponseHandler } from "../utils/apiResponse";

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return ResponseHandler.error(res, "Email, name, and password are required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      const result = await authService.register(email, name, password, ip, userAgent);
      return ResponseHandler.success(res, result, "Successfully registered.", 201);
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || "Registration failed.", null, 400);
    }
  }

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return ResponseHandler.error(res, "Email and password are required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      const result = await authService.login(email, password, ip, userAgent);
      return ResponseHandler.success(res, result, "Successfully authenticated.");
    } catch (e: any) {
      const status = e.message.includes("locked") ? 403 : 401;
      return ResponseHandler.error(res, e.message || "Authentication failed.", null, status);
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ResponseHandler.error(res, "Refresh token is required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      const result = await authService.refreshToken(refreshToken, ip, userAgent);
      return ResponseHandler.success(res, result, "Token refreshed successfully.");
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || "Token refresh failed.", null, 401);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseHandler.error(res, "Unauthorized", null, 401);
      }
      const { refreshToken } = req.body;
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      await authService.logout(req.user.id, refreshToken, ip, userAgent);
      return ResponseHandler.success(res, null, "Successfully logged out.");
    } catch (e: any) {
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

  async requestPasswordReset(req: AuthenticatedRequest, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return ResponseHandler.error(res, "Email is required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      const resetToken = await authService.requestPasswordReset(email, ip, userAgent);
      return ResponseHandler.success(res, { resetToken }, "Password reset request processed.");
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || "Failed to process password reset.", null, 400);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return ResponseHandler.error(res, "Token and new password are required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      await authService.resetPassword(token, password, ip, userAgent);
      return ResponseHandler.success(res, null, "Password reset successfully completed.");
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || "Failed to reset password.", null, 400);
    }
  }

  async verifyEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const token = (req.body.token || req.query.token) as string;
      if (!token) {
        return ResponseHandler.error(res, "Verification token is required.", null, 400);
      }
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      await authService.verifyEmail(token, ip, userAgent);
      return ResponseHandler.success(res, null, "Email verified successfully.");
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || "Failed to verify email.", null, 400);
    }
  }

  async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const sessions = await authService.getActiveSessions(req.user.id);
      return ResponseHandler.success(res, sessions, "Fetched active sessions.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async revokeSession(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const { sessionId } = req.params;
      const ip = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";

      await authService.revokeSession(req.user.id, sessionId, ip, userAgent);
      return ResponseHandler.success(res, null, "Session revoked successfully.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }

  async getSecurityLogs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return ResponseHandler.error(res, "Unauthorized", null, 401);
      const logs = await authService.getSecurityLogs(req.user.id);
      return ResponseHandler.success(res, logs, "Fetched security logs.");
    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const authController = new AuthController();
