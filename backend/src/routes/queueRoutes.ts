import { Router } from "express";
import { queueController } from "../controllers/queueController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { QueueEntryIdParamSchema, DoctorIdParamSchema } from "../validators/queueValidator";

const router = Router();

// Patient Queue Status
router.get("/my", requireAuth, requireRole("patient", "admin"), (req, res) => queueController.getMyQueueStatus(req, res));

// Doctor Queue View
router.get("/:doctorId", requireAuth, requireRole("doctor", "receptionist", "staff", "admin"), validate({ params: DoctorIdParamSchema }), (req, res) => queueController.getDoctorQueue(req, res));
router.get("/", requireAuth, requireRole("doctor", "receptionist", "staff", "admin"), (req, res) => queueController.getDoctorQueue(req, res));

// Doctor consultation controls with Zod params validation
router.post("/:queueEntryId/call", requireAuth, requireRole("doctor", "admin"), validate({ params: QueueEntryIdParamSchema }), (req, res) => queueController.callPatient(req, res));
router.post("/:queueEntryId/start", requireAuth, requireRole("doctor", "admin"), validate({ params: QueueEntryIdParamSchema }), (req, res) => queueController.startConsultation(req, res));
router.post("/:queueEntryId/complete", requireAuth, requireRole("doctor", "admin"), validate({ params: QueueEntryIdParamSchema }), (req, res) => queueController.completeConsultation(req, res));

export default router;
