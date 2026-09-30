import { Request, Response } from "express";
import { registerWalkIn } from "../services/walkInService";
import { hasClinicAccess, getDoctorClinicId, CLINIC_A_ID } from "../utils/clinicIsolation";

export async function createWalkIn(req: Request, res: Response) {
  try {
    const {
      name,
      patient_name,
      phone,
      doctor_id,
      doctor_name,
      priority,
      age
    } = req.body;

    const resolvedName = name || patient_name;
    if (!resolvedName || !phone) {
      return res.status(400).json({
        message: "Patient name and phone number are required"
      });
    }

    const requestedDoctorId = doctor_id ? String(doctor_id) : "1";

    // Multi-tenancy: Staff's authorized clinic is derived from req.user
    const userClinicId = (req.user as any)?.clinic_id || CLINIC_A_ID;

    // Verify doctor belongs to the staff's clinic
    const docClinicId = await getDoctorClinicId(requestedDoctorId);
    if (docClinicId && !hasClinicAccess(req.user, docClinicId)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied. Cannot register walk-in for a doctor at a different clinic.",
      });
    }

    const result = await registerWalkIn({
      name: resolvedName,
      phone,
      clinic_id: userClinicId,
      doctor_id: requestedDoctorId,
      priority: priority ? (typeof priority === "boolean" ? (priority ? "critical" : "normal") : String(priority)) : "normal"
    });

    return res.status(201).json({
      message: "Walk-in registered successfully",
      data: {
        id: result.queueEntry.id,
        token_number: result.queueEntry.id.replace(/\D/g, "").slice(0, 4) || "105",
        patient_name: result.patient.full_name,
        name: result.patient.full_name,
        phone: result.patient.phone,
        doctor_id: result.queueEntry.doctor_id,
        doctor_name: doctor_name || "Dr. Arjun Mehta",
        priority: result.queueEntry.priority === "critical" || result.queueEntry.priority === "priority",
        status: "Waiting",
        scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...result
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to register walk-in",
      error: error instanceof Error
        ? error.message
        : "Unknown error"
    });
  }
}
