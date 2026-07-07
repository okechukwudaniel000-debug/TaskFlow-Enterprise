import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

router.use(authMiddleware);

router.get("/", projectController.getProjects);
router.post("/", RequestValidator.validateBody(["name", "workspaceId"]), projectController.createProject);
router.put("/:id", projectController.updateProject);
router.post("/:id/favorite", projectController.toggleFavorite);
router.post("/:id/archive", projectController.archiveProject);
router.post("/:id/duplicate", projectController.duplicateProject);

export default router;
