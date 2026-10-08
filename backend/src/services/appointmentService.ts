import { auditService } from "./auditService";
import {
  appointmentRepository,
  ClinicRecord,
  DoctorRecord,
  AppointmentRecord,
  appointmentStore,
} from "../repositories/appointmentRepository";
import { queueRepository, memoryStore } from "../repositories/queueRepository";

export class AppointmentService {
  async getClinics(): Promise<ClinicRecord[]> {
    return appointmentRepository.getClinics();
  }

  async getDoctors(clinicId?: string): Promise<DoctorRecord[]> {
    return appointmentRepository.getDoctors(clinicId);
  }

  async bookAppointment(data: {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    scheduled_at: string;
    reason?: string;
    patient_name?: string;
    patient_phone?: string;
  }): Promise<AppointmentRecord> {
    if (!data.clinic_id || !data.doctor_id || !data.scheduled_at) {
      throw new Error("clinic_id, doctor_id, and scheduled_at are required to book an appointment");
    }

    const created = await appointmentRepository.createAppointment({
      clinic_id: data.clinic_id,
      patient_id: data.patient_id || "patient-anon",
      doctor_id: data.doctor_id,
      scheduled_at: data.scheduled_at,
      reason: data.reason || "General Consultation",
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
    });
    auditService.log({
      clinicId: data.clinic_id,
      userId: data.patient_id,
      action: "APPOINTMENT_CREATED",
      resourceType: "appointment",
      resourceId: created.id,
      metadata: { doctor_id: data.doctor_id, scheduled_at: data.scheduled_at },
    });
    return created;
  }

  async getMyAppointments(patientIdentifier?: string): Promise<AppointmentRecord[]> {
    const list = await appointmentRepository.getPatientAppointments(patientIdentifier);
    // Filter out cancelled unless explicitly queried
    return list.filter((a) => a.status !== "cancelled");
  }

  async rescheduleAppointment(id: string, newScheduledAt: string): Promise<AppointmentRecord> {
    return appointmentRepository.rescheduleAppointment(id, newScheduledAt);
  }

  async cancelAppointment(id: string): Promise<AppointmentRecord> {
    return appointmentRepository.cancelAppointment(id);
  }

  /**
   * Check in an appointment on appointment day -> generates queue_entries row
   */
  async checkInAppointment(appointmentId: string, patientIdentifier?: string) {
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    if (appointment.status === "cancelled") {
      throw new Error("Cannot check in for a cancelled appointment");
    }

    // Check if patient already has an active queue entry for this appointment
    const existingQueueEntry = await queueRepository.getQueueEntryByAppointmentId(appointmentId);
    if (existingQueueEntry) {
      return {
        message: "Patient already checked in",
        queueEntry: existingQueueEntry,
        appointment,
      };
    }

    // Register patient in cache if available
    if (appointment.patient) {
      memoryStore.patients.set(appointment.patient_id, {
        id: appointment.patient_id,
        full_name: appointment.patient.name,
        phone: appointment.patient.phone,
        created_at: new Date().toISOString(),
      });
    }

    // Look up doctor name
    const doctor = appointmentStore.doctors.get(appointment.doctor_id);

    // Create new queue entry
    const queueEntry = await queueRepository.createQueueEntry({
      clinic_id: appointment.clinic_id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      doctor_name: doctor?.name || appointment.doctor?.name,
      appointment_id: appointment.id,
      priority: "normal",
      status: "waiting",
      joined_at: new Date().toISOString(),
    });

    // Update appointment status to checked_in
    const updatedAppointment = await appointmentRepository.updateStatus(appointmentId, "checked_in");
    auditService.log({
      clinicId: appointment.clinic_id,
      userId: appointment.patient_id,
      action: "APPOINTMENT_CHECKED_IN",
      resourceType: "appointment",
      resourceId: appointmentId,
      metadata: { queue_entry_id: queueEntry.id, doctor_id: appointment.doctor_id },
    });
    auditService.log({
      clinicId: appointment.clinic_id,
      userId: appointment.patient_id,
      action: "QUEUE_ENTRY_CREATED",
      resourceType: "queue_entry",
      resourceId: queueEntry.id,
      metadata: { appointment_id: appointmentId, doctor_id: appointment.doctor_id, priority: queueEntry.priority },
    });

    return {
      message: "Checked in successfully. Added to doctor queue.",
      queueEntry,
      appointment: updatedAppointment,
    };
  }
}

export const appointmentService = new AppointmentService();
