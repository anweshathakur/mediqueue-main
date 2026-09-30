import { Router } from "express";
import { queueController } from "../controllers/queueController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// Protect all private queue operations
router.get("/my", requireAuth, (req, res) => queueController.getMyQueueStatus(req, res));
router.get("/:doctorId", requireAuth, (req, res) => queueController.getDoctorQueue(req, res));
router.get("/", requireAuth, (req, res) => queueController.getDoctorQueue(req, res));

// Doctor actions
router.post("/:queueEntryId/call", requireAuth, (req, res) => queueController.callPatient(req, res));
router.post("/:queueEntryId/start", requireAuth, (req, res) => queueController.startConsultation(req, res));
router.post("/:queueEntryId/complete", requireAuth, (req, res) => queueController.completeConsultation(req, res));

export default router;
