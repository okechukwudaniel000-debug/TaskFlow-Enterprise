import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

router.post("/login", RequestValidator.validateEmail, authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getCurrentUser);
router.put("/profile", authMiddleware, authController.updateProfile);
router.get("/users", authMiddleware, authController.getUsers);

export default router;
