import { Router } from "express";
import { aiController } from "../controllers/aiController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

router.use(authMiddleware);

// AI Task Assistant endpoints
router.post("/generate-description", RequestValidator.validateBody(["title"]), aiController.generateDescription);
router.post("/generate-subtasks", RequestValidator.validateBody(["title"]), aiController.generateSubtasks);
router.post("/estimate-effort", RequestValidator.validateBody(["title"]), aiController.estimateEffort);
router.post("/suggest-priority", RequestValidator.validateBody(["title"]), aiController.suggestPriority);
router.post("/tasks/:taskId/summarize-discussion", aiController.summarizeDiscussions);

// AI Productivity Insights endpoint
router.post("/productivity-insights", RequestValidator.validateBody(["workspaceId"]), aiController.generateProductivityInsights);

export default router;
