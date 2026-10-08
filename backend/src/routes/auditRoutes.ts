import { Router } from "express";
import { auditController } from "../controllers/auditController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Only system administrators can query audit logs
router.get("/", requireAuth, requireRole("admin"), (req, res) => auditController.getAuditLogs(req, res));

export default router;
