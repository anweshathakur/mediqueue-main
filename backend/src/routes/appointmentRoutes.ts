import { Router } from "express";
import { appointmentController } from "../controllers/appointmentController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// Protected appointment endpoints
router.get("/my", requireAuth, (req, res) => appointmentController.getMyAppointments(req, res));
router.get("/", requireAuth, (req, res) => appointmentController.getMyAppointments(req, res));
router.post("/", requireAuth, (req, res) => appointmentController.bookAppointment(req, res));
router.post("/:id/check-in", requireAuth, (req, res) => appointmentController.checkInAppointment(req, res));
router.post("/:id/checkin", requireAuth, (req, res) => appointmentController.checkInAppointment(req, res));
router.patch("/:id/reschedule", requireAuth, (req, res) => appointmentController.rescheduleAppointment(req, res));
router.patch("/:id/cancel", requireAuth, (req, res) => appointmentController.cancelAppointment(req, res));
router.delete("/:id", requireAuth, (req, res) => appointmentController.cancelAppointment(req, res));

export default router;
