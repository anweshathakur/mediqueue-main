import { Router } from "express";
import { queueController } from "../controllers/queueController";

const router = Router();

// Retrieve doctor queue (GET /api/queue/:doctorId or GET /api/queue)
router.get("/:doctorId", (req, res) => queueController.getDoctorQueue(req, res));
router.get("/", (req, res) => queueController.getDoctorQueue(req, res));

// Doctor queue actions
router.post("/:queueEntryId/call", (req, res) => queueController.callPatient(req, res));
router.post("/:queueEntryId/start", (req, res) => queueController.startConsultation(req, res));
router.post("/:queueEntryId/complete", (req, res) => queueController.completeConsultation(req, res));

export default router;
