import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/apiResponse";

export class RequestValidator {
  static validateBody(requiredFields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const missingFields = requiredFields.filter(field => {
        const val = req.body[field];
        return val === undefined || val === null || (typeof val === "string" && val.trim() === "");
      });

      if (missingFields.length > 0) {
        return ResponseHandler.error(
          res,
          `Invalid request payload. Missing fields: ${missingFields.join(", ")}`,
          null,
          400
        );
      }

      next();
    };
  }

  static validateEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ResponseHandler.error(res, "Please provide a valid email address.", null, 400);
    }
    next();
  }
}
