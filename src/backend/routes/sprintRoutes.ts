import { Router } from "express";
import { sprintController } from "../controllers/sprintController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", sprintController.getSprints);
router.get("/:id", sprintController.getSprintById);
router.post("/", sprintController.createSprint);
router.put("/:id", sprintController.updateSprint);
router.post("/:id/start", sprintController.startSprint);
router.post("/:id/complete", sprintController.completeSprint);
router.delete("/:id", sprintController.deleteSprint);

export default router;
