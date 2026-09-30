import { Router } from "express";
import { createWalkIn } from "../controllers/walkInController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Walk-in registration: Receptionist/Staff or Admin ONLY
router.post("/", requireAuth, requireRole("receptionist", "staff", "admin"), createWalkIn);

export default router;
