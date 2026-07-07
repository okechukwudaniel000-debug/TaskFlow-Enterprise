import { Request, Response, NextFunction } from "express";
import { CacheManager } from "../cache/redis";

export function cacheMiddleware(ttlSeconds = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;
    try {
      const cachedResponse = await CacheManager.get(cacheKey);
      if (cachedResponse) {
        console.log(`[Cache Hit] Serving response for: ${req.originalUrl}`);
        return res.json(cachedResponse);
      }

      // Override res.json to capture response payload
      const originalJson = res.json;
      res.json = function (body) {
        // Cache success responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheManager.set(cacheKey, body, ttlSeconds).catch(err => 
            console.error("Failed to cache response:", err)
          );
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (e) {
      console.error("Cache middleware error:", e);
      next();
    }
  };
}
