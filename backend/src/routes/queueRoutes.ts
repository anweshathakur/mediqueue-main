import { Router } from "express";
import { queueController } from "../controllers/queueController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Patient Queue Status: Patient or Admin
router.get("/my", requireAuth, requireRole("patient", "admin"), (req, res) => queueController.getMyQueueStatus(req, res));

// Doctor Queue View: Doctor, Receptionist/Staff, or Admin
router.get("/:doctorId", requireAuth, requireRole("doctor", "receptionist", "staff", "admin"), (req, res) => queueController.getDoctorQueue(req, res));
router.get("/", requireAuth, requireRole("doctor", "receptionist", "staff", "admin"), (req, res) => queueController.getDoctorQueue(req, res));

// Doctor consultation controls: Doctor or Admin ONLY
router.post("/:queueEntryId/call", requireAuth, requireRole("doctor", "admin"), (req, res) => queueController.callPatient(req, res));
router.post("/:queueEntryId/start", requireAuth, requireRole("doctor", "admin"), (req, res) => queueController.startConsultation(req, res));
router.post("/:queueEntryId/complete", requireAuth, requireRole("doctor", "admin"), (req, res) => queueController.completeConsultation(req, res));

export default router;
