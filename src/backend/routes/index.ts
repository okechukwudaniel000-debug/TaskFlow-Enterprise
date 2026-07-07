import { Router } from "express";
import authRoutes from "./authRoutes";
import workspaceRoutes from "./workspaceRoutes";
import projectRoutes from "./projectRoutes";
import taskRoutes from "./taskRoutes";
import notificationRoutes from "./notificationRoutes";
import analyticsRoutes from "./analyticsRoutes";
import { rateLimiter } from "../middleware/rateLimiter";

const apiRouter = Router();

// Apply request rate limiter to all API endpoints
apiRouter.use(rateLimiter);

apiRouter.use("/auth", authRoutes);
apiRouter.use("/workspaces", workspaceRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/analytics", analyticsRoutes);

export default apiRouter;
