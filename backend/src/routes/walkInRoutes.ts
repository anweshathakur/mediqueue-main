import { Router } from "express";
import { createWalkIn } from "../controllers/walkInController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, createWalkIn);

export default router;
