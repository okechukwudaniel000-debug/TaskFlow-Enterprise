import { Router } from "express";
import { organizationController } from "../controllers/organizationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", organizationController.getOrganizations);
router.get("/:id", organizationController.getOrganizationById);
router.post("/", organizationController.createOrganization);
router.put("/:id", organizationController.updateOrganization);
router.delete("/:id", organizationController.deleteOrganization);

export default router;
