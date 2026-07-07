import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/userRepository";
import { ResponseHandler } from "../utils/apiResponse";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // For developer testing / local simulation fallback
      // Look for custom session header
      const mockUserId = req.headers["x-user-id"] as string;
      if (mockUserId) {
        const mockUser = await userRepository.getById(mockUserId);
        if (mockUser) {
          req.user = mockUser;
          return next();
        }
      }
      return ResponseHandler.error(res, "Authentication credentials not provided.", null, 401);
    }

    const userId = authHeader.split(" ")[1];
    if (!userId) {
      return ResponseHandler.error(res, "Invalid token format.", null, 401);
    }

    const user = await userRepository.getById(userId);
    if (!user) {
      return ResponseHandler.error(res, "User session not found.", null, 401);
    }

    req.user = user;
    next();
  } catch (e) {
    ResponseHandler.internalError(res, e);
  }
}
