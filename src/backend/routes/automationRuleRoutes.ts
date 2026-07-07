import { Router } from "express";
import { automationRuleController } from "../controllers/automationRuleController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", automationRuleController.getRules);
router.get("/:id", automationRuleController.getRuleById);
router.post("/", automationRuleController.createRule);
router.put("/:id", automationRuleController.updateRule);
router.delete("/:id", automationRuleController.deleteRule);

export default router;
