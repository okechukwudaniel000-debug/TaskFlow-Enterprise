import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/apiResponse";

const requestLog = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max 100 requests per minute per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();

  let timestamps = requestLog.get(ip) || [];
  // Filter out expired timestamps
  timestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return ResponseHandler.error(
      res,
      "Too many requests from this client. Please try again after one minute.",
      null,
      429
    );
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);
  next();
}
