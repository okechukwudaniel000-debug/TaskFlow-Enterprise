import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { RequestValidator } from "../validators/requestValidator";

const router = Router();

// Registration and Authentication
router.post(
  "/register",
  RequestValidator.validateEmail,
  RequestValidator.validateBody(["name", "password"]),
  authController.register
);

router.post(
  "/login",
  RequestValidator.validateEmail,
  RequestValidator.validateBody(["password"]),
  authController.login
);

router.post(
  "/refresh",
  RequestValidator.validateBody(["refreshToken"]),
  authController.refresh
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

// Password Reset and Email Verification
router.post(
  "/forgot-password",
  RequestValidator.validateEmail,
  authController.requestPasswordReset
);

router.post(
  "/reset-password",
  RequestValidator.validateBody(["token", "password"]),
  authController.resetPassword
);

router.post(
  "/verify-email",
  authController.verifyEmail
);

// Active Sessions and Audit Logs
router.get(
  "/sessions",
  authMiddleware,
  authController.getSessions
);

router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  authController.revokeSession
);

router.get(
  "/audit-logs",
  authMiddleware,
  authController.getSecurityLogs
);

// User Profiles
router.get("/me", authMiddleware, authController.getCurrentUser);
router.put("/profile", authMiddleware, authController.updateProfile);
router.get("/users", authMiddleware, authController.getUsers);

export default router;
