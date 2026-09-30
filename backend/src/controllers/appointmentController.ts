import { Request, Response } from "express";
import { appointmentService } from "../services/appointmentService";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { isOwnerOrPrivileged } from "../utils/ownership";

export class AppointmentController {
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

      // IDOR Protection: For patient roles, bind patient_id directly to authenticated user
      const userRole = (req.user?.role || (req.user as any)?.appRole || "patient").toLowerCase();
      let effectivePatientId = patient_id;

      if (userRole === "patient" || (!userRole || userRole === "authenticated")) {
        effectivePatientId = req.user?.id || req.user?.email || patient_id || "patient-anon";
      }

      const appointment = await appointmentService.bookAppointment({
        clinic_id,
        patient_id: effectivePatientId,
        doctor_id,
        scheduled_at,
        reason,
        patient_name: patient_name || req.user?.user_metadata?.name || req.user?.user_metadata?.full_name,
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

  async getMyAppointments(req: Request, res: Response) {
    try {
      const userRole = (req.user?.role || (req.user as any)?.appRole || "patient").toLowerCase();
      
      // IDOR Protection: Regular patients can ONLY view their own appointments
      let patientId = req.user?.email || req.user?.id || "demo123@gmail.com";
      
      // Only privileged staff/admins can query another patient's appointments via query param
      if ((userRole === "admin" || userRole === "receptionist" || userRole === "staff") && req.query.patient_id) {
        patientId = req.query.patient_id as string;
      }

      const appointments = await appointmentService.getMyAppointments(patientId);
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch appointments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async rescheduleAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { scheduled_at } = req.body;

      if (!scheduled_at) {
        return res.status(400).json({ message: "scheduled_at is required" });
      }

      const existing = await appointmentRepository.getAppointmentById(id);
      if (!existing) {
        return res.status(404).json({ message: `Appointment ${id} not found` });
      }

      // IDOR Protection: Verify ownership
      if (!isOwnerOrPrivileged(req.user, existing.patient_id, existing.patient?.email)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You can only reschedule your own appointments.",
        });
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

  async cancelAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await appointmentRepository.getAppointmentById(id);
      
      if (!existing) {
        return res.status(404).json({ message: `Appointment ${id} not found` });
      }

      // IDOR Protection: Verify ownership
      if (!isOwnerOrPrivileged(req.user, existing.patient_id, existing.patient?.email)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You can only cancel your own appointments.",
        });
      }

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

  async checkInAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const existing = await appointmentRepository.getAppointmentById(id);
      if (!existing) {
        return res.status(404).json({ message: `Appointment ${id} not found` });
      }

      // IDOR Protection: Verify ownership
      if (!isOwnerOrPrivileged(req.user, existing.patient_id, existing.patient?.email)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You can only check in for your own appointments.",
        });
      }

      const result = await appointmentService.checkInAppointment(id, existing.patient_id);
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
