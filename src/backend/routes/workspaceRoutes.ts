import { Router } from "express";
import { workspaceController } from "../controllers/workspaceController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

router.use(authMiddleware);

router.get("/", workspaceController.getWorkspaces);
router.post("/", RequestValidator.validateBody(["name"]), workspaceController.createWorkspace);
router.put("/:id", RequestValidator.validateBody(["name"]), workspaceController.updateWorkspace);
router.delete("/:id", workspaceController.deleteWorkspace);
router.post("/:id/invite", RequestValidator.validateBody(["email", "role"]), workspaceController.inviteMember);
router.delete("/:id/members/:userId", workspaceController.removeMember);

export default router;
