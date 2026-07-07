import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { cacheMiddleware } from "../middleware/cacheMiddleware";

const router = Router();

router.use(authMiddleware);

// Cache analytics responses for 10 seconds
router.get("/workspaces/:workspaceId", cacheMiddleware(10), analyticsController.getWorkspaceAnalytics);

export default router;
