import { Request, Response } from "express";
import { appointmentService } from "../services/appointmentService";

export class AppointmentController {
  /**
   * GET /api/clinics
   */
  async getClinics(req: Request, res: Response) {
    try {
      const clinics = await appointmentService.getClinics();
      return res.status(200).json(clinics);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch clinics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * GET /api/doctors?clinic_id=...
   */
  async getDoctors(req: Request, res: Response) {
    try {
      const clinicId = req.query.clinic_id as string;
      const doctors = await appointmentService.getDoctors(clinicId);
      return res.status(200).json(doctors);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch doctors",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/appointments
   */
  async bookAppointment(req: Request, res: Response) {
    try {
      const {
        clinic_id,
        patient_id,
        doctor_id,
        scheduled_at,
        reason,
        patient_name,
        patient_phone,
      } = req.body;

      if (!clinic_id || !doctor_id || !scheduled_at) {
        return res.status(400).json({
          message: "clinic_id, doctor_id, and scheduled_at are required",
        });
      }

      const appointment = await appointmentService.bookAppointment({
        clinic_id,
        patient_id: patient_id || "patient-anon",
        doctor_id,
        scheduled_at,
        reason,
        patient_name,
        patient_phone,
      });

      return res.status(201).json({
        message: "Appointment booked successfully",
        data: appointment,
        ...appointment,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to book appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * GET /api/appointments/my or GET /api/appointments
   */
  async getMyAppointments(req: Request, res: Response) {
    try {
      const patientId = (req.query.patient_id || req.query.email || req.query.phone) as string;
      const appointments = await appointmentService.getMyAppointments(patientId);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch appointments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * PATCH /api/appointments/:id/reschedule
   */
  async rescheduleAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { scheduled_at } = req.body;

      if (!scheduled_at) {
        return res.status(400).json({ message: "scheduled_at is required" });
      }

      const updated = await appointmentService.rescheduleAppointment(id, scheduled_at);
      return res.status(200).json({
        message: "Appointment rescheduled successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to reschedule appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * PATCH /api/appointments/:id/cancel or DELETE /api/appointments/:id
   */
  async cancelAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cancelled = await appointmentService.cancelAppointment(id);
      return res.status(200).json({
        message: "Appointment cancelled successfully",
        data: cancelled,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to cancel appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/appointments/:id/check-in
   */
  async checkInAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patientId = (req.body?.patient_id || req.query?.patient_id) as string;

      if (!id) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const result = await appointmentService.checkInAppointment(id, patientId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to check in appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const appointmentController = new AppointmentController();
