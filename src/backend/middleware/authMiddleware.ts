import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/userRepository";
import { ResponseHandler } from "../utils/apiResponse";
import { TokenService } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Developer / test simulation fallback using direct user-id header if no Bearer token is found
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

    const token = authHeader.split(" ")[1];
    if (!token) {
      return ResponseHandler.error(res, "Invalid token format.", null, 401);
    }

    try {
      const decodedPayload = TokenService.verifyAccessToken(token);
      const user = await userRepository.getById(decodedPayload.userId);
      if (!user) {
        return ResponseHandler.error(res, "User profile not found.", null, 401);
      }

      req.user = user;
      next();
    } catch (tokenError: any) {
      // Handle TokenExpiredError or JsonWebTokenError
      if (tokenError.name === "TokenExpiredError") {
        return ResponseHandler.error(res, "Token has expired.", null, 401);
      }
      return ResponseHandler.error(res, "Invalid access token.", null, 401);
    }
  } catch (e) {
    ResponseHandler.internalError(res, e);
  }
}
