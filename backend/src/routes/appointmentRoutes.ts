import { Router } from "express";
import { appointmentController } from "../controllers/appointmentController";

const router = Router();

// 1. Get clinics: GET /api/clinics (handled directly or mounted)
// 2. Get doctors: GET /api/doctors
// 3. Appointments endpoints:
router.get("/my", (req, res) => appointmentController.getMyAppointments(req, res));
router.get("/", (req, res) => appointmentController.getMyAppointments(req, res));
router.post("/", (req, res) => appointmentController.bookAppointment(req, res));
router.patch("/:id/reschedule", (req, res) => appointmentController.rescheduleAppointment(req, res));
router.patch("/:id/cancel", (req, res) => appointmentController.cancelAppointment(req, res));
router.delete("/:id", (req, res) => appointmentController.cancelAppointment(req, res));

export default router;
