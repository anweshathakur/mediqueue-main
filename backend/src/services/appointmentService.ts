import {
  appointmentRepository,
  ClinicRecord,
  DoctorRecord,
  AppointmentRecord,
} from "../repositories/appointmentRepository";

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

    return appointmentRepository.createAppointment({
      clinic_id: data.clinic_id,
      patient_id: data.patient_id || "patient-anon",
      doctor_id: data.doctor_id,
      scheduled_at: data.scheduled_at,
      reason: data.reason || "General Consultation",
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
    });
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
}

export const appointmentService = new AppointmentService();
