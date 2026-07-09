import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", searchController.search);

export default router;
