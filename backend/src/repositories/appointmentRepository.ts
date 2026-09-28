import { supabase } from "../config/supabase";
import crypto from "crypto";

export interface ClinicRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone?: string;
  created_at?: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  clinic_id: string;
  room_number?: string;
  status: "available" | "on_break" | "off_duty" | "delayed";
  current_delay?: number;
  patients_ahead?: number;
}

export interface AppointmentRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: "booked" | "confirmed" | "cancelled" | "no_show" | "completed";
  reason?: string | null;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    room_number?: string;
  };
  clinic?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  patient?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

// In-Memory fallback store for clinics, doctors, and appointments
export const appointmentStore = {
  clinics: new Map<string, ClinicRecord>([
    [
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        name: "MUJ Health Centre",
        address: "100 Medical Blvd, Jaipur, Rajasthan",
        phone: "+91 (555) 019-2834",
        timezone: "Asia/Kolkata",
        created_at: new Date().toISOString(),
      },
    ],
    [
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        name: "MediQueue Central Hospital",
        address: "24 Park Road, Healthcare Hub",
        phone: "+91 (555) 019-8800",
        timezone: "Asia/Kolkata",
        created_at: new Date().toISOString(),
      },
    ],
  ]),

  doctors: new Map<string, DoctorRecord>([
    [
      "1",
      {
        id: "1",
        name: "Dr. Arjun Mehta",
        specialty: "General Medicine",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 102",
        status: "available",
        current_delay: 0,
        patients_ahead: 2,
      },
    ],
    [
      "2",
      {
        id: "2",
        name: "Dr. Priya Sharma",
        specialty: "Cardiology",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 204",
        status: "delayed",
        current_delay: 30,
        patients_ahead: 5,
      },
    ],
    [
      "3",
      {
        id: "3",
        name: "Dr. Rohan Kapoor",
        specialty: "Orthopedics",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 301",
        status: "available",
        current_delay: 0,
        patients_ahead: 1,
      },
    ],
    [
      "4",
      {
        id: "4",
        name: "Dr. Sneha Iyer",
        specialty: "Dermatology",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 108",
        status: "available",
        current_delay: 0,
        patients_ahead: 3,
      },
    ],
    [
      "5",
      {
        id: "5",
        name: "Dr. Vikram Rao",
        specialty: "Pediatrics",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 115",
        status: "delayed",
        current_delay: 15,
        patients_ahead: 4,
      },
    ],
    [
      "6",
      {
        id: "6",
        name: "Dr. Ananya Das",
        specialty: "ENT",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        room_number: "Room 210",
        status: "available",
        current_delay: 0,
        patients_ahead: 0,
      },
    ],
  ]),

  appointments: new Map<string, AppointmentRecord>([
    [
      "apt-101",
      {
        id: "apt-101",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "patient@mediqueue.com",
        doctor_id: "1",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "booked",
        reason: "Routine General Checkup",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        doctor: {
          id: "1",
          name: "Dr. Arjun Mehta",
          specialty: "General Medicine",
          room_number: "Room 102",
        },
        clinic: {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          name: "MUJ Health Centre",
          address: "100 Medical Blvd, Jaipur, Rajasthan",
          phone: "+91 (555) 019-2834",
        },
        patient: {
          id: "patient@mediqueue.com",
          name: "Rahul Sharma",
          phone: "+91 9876543210",
        },
      },
    ],
  ]),
};

export class AppointmentRepository {
  /**
   * Fetch all clinics
   */
  async getClinics(): Promise<ClinicRecord[]> {
    try {
      const { data, error } = await supabase.from("clinics").select("*");
      if (!error && data && data.length > 0) {
        return data as ClinicRecord[];
      }
    } catch (err) {}

    return Array.from(appointmentStore.clinics.values());
  }

  /**
   * Fetch doctors (optionally filtered by clinic_id)
   */
  async getDoctors(clinicId?: string): Promise<DoctorRecord[]> {
    try {
      let query = supabase.from("doctors").select("*");
      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as DoctorRecord[];
      }
    } catch (err) {}

    const all = Array.from(appointmentStore.doctors.values());
    if (clinicId) {
      return all.filter((d) => d.clinic_id === clinicId);
    }
    return all;
  }

  /**
   * Create an appointment
   */
  async createAppointment(data: {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    scheduled_at: string;
    reason?: string;
    patient_name?: string;
    patient_phone?: string;
  }): Promise<AppointmentRecord> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `apt-${Date.now()}`;
    const doc = appointmentStore.doctors.get(data.doctor_id) || Array.from(appointmentStore.doctors.values())[0];
    const clinic = appointmentStore.clinics.get(data.clinic_id) || Array.from(appointmentStore.clinics.values())[0];

    const record: AppointmentRecord = {
      id,
      clinic_id: data.clinic_id || clinic.id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id || doc.id,
      scheduled_at: data.scheduled_at,
      status: "booked",
      reason: data.reason || "General Consultation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      doctor: {
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        room_number: doc.room_number,
      },
      clinic: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
      },
      patient: {
        id: data.patient_id,
        name: data.patient_name || "Patient",
        phone: data.patient_phone || "",
      },
    };

    try {
      const { data: inserted, error } = await supabase
        .from("appointments")
        .insert({
          id,
          clinic_id: record.clinic_id,
          patient_id: record.patient_id,
          doctor_id: record.doctor_id,
          scheduled_at: record.scheduled_at,
          status: record.status,
          reason: record.reason,
        })
        .select()
        .single();

      if (!error && inserted) {
        appointmentStore.appointments.set(id, record);
        return record;
      }
    } catch (err) {}

    appointmentStore.appointments.set(id, record);
    return record;
  }

  /**
   * Fetch appointments for a specific patient or all active
   */
  async getPatientAppointments(patientIdentifier?: string): Promise<AppointmentRecord[]> {
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          clinic_id,
          patient_id,
          doctor_id,
          scheduled_at,
          status,
          reason,
          created_at,
          updated_at
        `);

      if (patientIdentifier) {
        query = query.or(`patient_id.eq.${patientIdentifier}`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item: any) => {
          const doc = appointmentStore.doctors.get(item.doctor_id) || Array.from(appointmentStore.doctors.values())[0];
          const clinic = appointmentStore.clinics.get(item.clinic_id) || Array.from(appointmentStore.clinics.values())[0];
          return {
            ...item,
            doctor: {
              id: doc.id,
              name: doc.name,
              specialty: doc.specialty,
            },
            clinic: {
              id: clinic.id,
              name: clinic.name,
              address: clinic.address,
              phone: clinic.phone,
            },
          };
        });
      }
    } catch (err) {}

    const all = Array.from(appointmentStore.appointments.values());
    if (patientIdentifier) {
      return all.filter(
        (a) =>
          a.patient_id === patientIdentifier ||
          a.patient?.email === patientIdentifier ||
          a.patient?.phone === patientIdentifier
      );
    }
    return all;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(id: string, newScheduledAt: string): Promise<AppointmentRecord> {
    try {
      await supabase
        .from("appointments")
        .update({ scheduled_at: newScheduledAt, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (err) {}

    const existing = appointmentStore.appointments.get(id);
    if (existing) {
      existing.scheduled_at = newScheduledAt;
      existing.updated_at = new Date().toISOString();
      appointmentStore.appointments.set(id, existing);
      return existing;
    }

    throw new Error(`Appointment ${id} not found`);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string): Promise<AppointmentRecord> {
    try {
      await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (err) {}

    const existing = appointmentStore.appointments.get(id);
    if (existing) {
      existing.status = "cancelled";
      existing.updated_at = new Date().toISOString();
      appointmentStore.appointments.set(id, existing);
      return existing;
    }

    throw new Error(`Appointment ${id} not found`);
  }
}

export const appointmentRepository = new AppointmentRepository();
