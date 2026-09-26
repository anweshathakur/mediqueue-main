import { Router } from "express";
import { createWalkIn } from "../controllers/walkInController";

const router = Router();

router.post("/", createWalkIn);

export default router;