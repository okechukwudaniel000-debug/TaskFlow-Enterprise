import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/apiResponse";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Unhandled Backend Exception:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";
  const errors = process.env.NODE_ENV === "development" ? err.stack || err : undefined;

  ResponseHandler.error(res, message, errors, status);
}
