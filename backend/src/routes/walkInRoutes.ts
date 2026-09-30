import { Router } from "express";
import { createWalkIn } from "../controllers/walkInController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { CreateWalkInSchema } from "../validators/walkInValidator";

const router = Router();

// Walk-in registration with Zod validation
router.post(
  "/",
  requireAuth,
  requireRole("receptionist", "staff", "admin"),
  validate({ body: CreateWalkInSchema }),
  createWalkIn
);

export default router;
