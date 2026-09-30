import { Router } from "express";
import { appointmentController } from "../controllers/appointmentController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  BookAppointmentSchema,
  RescheduleAppointmentSchema,
  AppointmentIdParamSchema,
} from "../validators/appointmentValidator";

const router = Router();

// Patient Appointment listings
router.get("/my", requireAuth, requireRole("patient", "admin"), (req, res) => appointmentController.getMyAppointments(req, res));
router.get("/", requireAuth, requireRole("patient", "admin"), (req, res) => appointmentController.getMyAppointments(req, res));

// Appointment booking & lifecycle with Zod validation
router.post(
  "/",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ body: BookAppointmentSchema }),
  (req, res) => appointmentController.bookAppointment(req, res)
);

router.post(
  "/:id/check-in",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ params: AppointmentIdParamSchema }),
  (req, res) => appointmentController.checkInAppointment(req, res)
);

router.post(
  "/:id/checkin",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ params: AppointmentIdParamSchema }),
  (req, res) => appointmentController.checkInAppointment(req, res)
);

router.patch(
  "/:id/reschedule",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ params: AppointmentIdParamSchema, body: RescheduleAppointmentSchema }),
  (req, res) => appointmentController.rescheduleAppointment(req, res)
);

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ params: AppointmentIdParamSchema }),
  (req, res) => appointmentController.cancelAppointment(req, res)
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("patient", "receptionist", "staff", "admin"),
  validate({ params: AppointmentIdParamSchema }),
  (req, res) => appointmentController.cancelAppointment(req, res)
);

export default router;
