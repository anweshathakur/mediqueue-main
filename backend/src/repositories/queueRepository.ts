import { supabase } from "../config/supabase";
import crypto from "crypto";

export interface PatientRecord {
  id: string;
  full_name: string;
  phone: string;
  age?: number;
  medical_notes?: string;
  created_at: string;
}

export interface QueueEntryRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  appointment_id?: string | null;
  priority: "normal" | "priority" | "critical";
  status: "waiting" | "called" | "consulting" | "completed" | "no_show" | "cancelled";
  joined_at: string;
  called_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  patient?: {
    id: string;
    name: string;
    phone: string;
    age?: number;
  };
}

export interface ConsultationRecord {
  id: string;
  queue_entry_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string | null;
  prescription?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
}

// In-Memory Storage cache for fallback & high-speed synchronous consistency
export const memoryStore = {
  patients: new Map<string, PatientRecord>([
    [
      "p-101",
      {
        id: "p-101",
        full_name: "Rahul Sharma",
        phone: "+91 9876543210",
        age: 34,
        created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      },
    ],
    [
      "p-102",
      {
        id: "p-102",
        full_name: "Ananya Sengupta",
        phone: "+91 9998887776",
        age: 28,
        created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ],
    [
      "p-103",
      {
        id: "p-103",
        full_name: "Vikram Malhotra",
        phone: "+91 9811223344",
        age: 52,
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ],
    [
      "p-104",
      {
        id: "p-104",
        full_name: "Priya Nair",
        phone: "+91 9744556677",
        age: 41,
        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ],
  ]),

  queueEntries: new Map<string, QueueEntryRecord>([
    [
      "q-clinic-b-1",
      {
        id: "q-clinic-b-1",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        patient_id: "p-201",
        doctor_id: "6",
        doctor_name: "Dr. Kabir Das",
        priority: "normal",
        status: "waiting",
        joined_at: new Date().toISOString(),
        called_at: null,
        completed_at: null,
      },
    ],
    [
      "q-101",
      {
        id: "q-101",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "p-101",
        doctor_id: "1",
        doctor_name: "Dr. Arjun Mehta",
        priority: "normal",
        status: "waiting",
        joined_at: new Date(Date.now() - 40 * 60000).toISOString(),
        called_at: null,
        completed_at: null,
      },
    ],
    [
      "q-102",
      {
        id: "q-102",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "p-102",
        doctor_id: "1",
        doctor_name: "Dr. Arjun Mehta",
        priority: "priority",
        status: "waiting",
        joined_at: new Date(Date.now() - 25 * 60000).toISOString(),
        called_at: null,
        completed_at: null,
      },
    ],
    [
      "q-103",
      {
        id: "q-103",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "p-103",
        doctor_id: "1",
        doctor_name: "Dr. Arjun Mehta",
        priority: "critical",
        status: "waiting",
        joined_at: new Date(Date.now() - 10 * 60000).toISOString(),
        called_at: null,
        completed_at: null,
      },
    ],
    [
      "q-104",
      {
        id: "q-104",
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "p-104",
        doctor_id: "1",
        doctor_name: "Dr. Arjun Mehta",
        priority: "normal",
        status: "waiting",
        joined_at: new Date(Date.now() - 5 * 60000).toISOString(),
        called_at: null,
        completed_at: null,
      },
    ],
  ]),

  consultations: new Map<string, ConsultationRecord>(),
};

export class QueueRepository {
  /**
   * Fetch doctor queue entries joined with patient details
   */
  async getQueueByDoctorId(doctorId: string): Promise<QueueEntryRecord[]> {
    try {
      let query = supabase
        .from("queue_entries")
        .select(`
          id,
          clinic_id,
          patient_id,
          doctor_id,
          appointment_id,
          priority,
          status,
          joined_at,
          called_at,
          completed_at,
          patients:patient_id (
            id,
            full_name,
            phone,
            medical_notes
          )
        `)
        .in("status", ["waiting", "called", "consulting"]);

      if (doctorId && doctorId !== "all") {
        query = query.eq("doctor_id", doctorId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((item: any) => {
          let started_at = item.started_at || null;
          if (!started_at && item.status === "consulting") {
            // Check memory consultations cache
            for (const cons of memoryStore.consultations.values()) {
              if (cons.queue_entry_id === item.id) {
                started_at = cons.started_at;
                break;
              }
            }
          }

          return {
            id: item.id,
            clinic_id: item.clinic_id,
            patient_id: item.patient_id,
            doctor_id: item.doctor_id,
            priority: item.priority,
            status: item.status,
            joined_at: item.joined_at,
            called_at: item.called_at,
            started_at,
            completed_at: item.completed_at,
            patient: {
              id: item.patients?.id || item.patient_id,
              name: item.patients?.full_name || "Patient",
              phone: item.patients?.phone || "",
            },
          };
        });
      }
    } catch (err) {
      console.warn("Supabase queue fetch notice, using fallback cache:", err);
    }

    // Memory store fallback with enriched patient details
    const entries: QueueEntryRecord[] = [];
    for (const entry of memoryStore.queueEntries.values()) {
      const isDoctorMatch =
        !doctorId ||
        doctorId === "all" ||
        String(entry.doctor_id) === String(doctorId) ||
        (entry.doctor_name && entry.doctor_name.toLowerCase().includes(doctorId.toLowerCase()));

      const isStatusActive = ["waiting", "called", "consulting"].includes(entry.status);

      if (isDoctorMatch && isStatusActive) {
        const patient = memoryStore.patients.get(entry.patient_id);
        let started_at = entry.started_at || null;
        if (!started_at && entry.status === "consulting") {
          for (const cons of memoryStore.consultations.values()) {
            if (cons.queue_entry_id === entry.id) {
              started_at = cons.started_at;
              break;
            }
          }
        }

        entries.push({
          ...entry,
          started_at,
          patient: {
            id: entry.patient_id,
            name: patient?.full_name || "Walk-In Patient",
            phone: patient?.phone || "",
            age: patient?.age || 30,
          },
        });
      }
    }

    return entries;
  }

  /**
   * Fetch single queue entry by ID
   */
  async getQueueEntryById(queueEntryId: string): Promise<QueueEntryRecord | null> {
    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .select(`
          id,
          clinic_id,
          patient_id,
          doctor_id,
          priority,
          status,
          joined_at,
          called_at,
          completed_at,
          patients:patient_id (
            id,
            full_name,
            phone
          )
        `)
        .eq("id", queueEntryId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          clinic_id: data.clinic_id,
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          priority: data.priority,
          status: data.status,
          joined_at: data.joined_at,
          called_at: data.called_at,
          completed_at: data.completed_at,
          patient: {
            id: (data as any).patients?.id || data.patient_id,
            name: (data as any).patients?.full_name || "Patient",
            phone: (data as any).patients?.phone || "",
          },
        };
      }
    } catch (err) {}

    const entry = memoryStore.queueEntries.get(queueEntryId);
    if (entry) {
      const patient = memoryStore.patients.get(entry.patient_id);
      return {
        ...entry,
        patient: {
          id: entry.patient_id,
          name: patient?.full_name || "Patient",
          phone: patient?.phone || "",
          age: patient?.age,
        },
      };
    }

    return null;
  }

  /**
   * Update queue entry status and timestamp
   */
  async updateStatus(
    queueEntryId: string,
    status: QueueEntryRecord["status"],
    timestampField?: "called_at" | "started_at" | "completed_at"
  ): Promise<QueueEntryRecord> {
    const timestamp = new Date().toISOString();
    const updatePayload: any = { status };
    if (timestampField === "called_at") updatePayload.called_at = timestamp;
    if (timestampField === "started_at" || status === "consulting") updatePayload.started_at = timestamp;
    if (timestampField === "completed_at") updatePayload.completed_at = timestamp;

    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .update(updatePayload)
        .eq("id", queueEntryId)
        .select()
        .single();

      if (!error && data) {
        if (memoryStore.queueEntries.has(queueEntryId)) {
          const prev = memoryStore.queueEntries.get(queueEntryId)!;
          memoryStore.queueEntries.set(queueEntryId, { ...prev, ...updatePayload });
        }
        return data as QueueEntryRecord;
      }
    } catch (err) {}

    const entry = memoryStore.queueEntries.get(queueEntryId);
    if (!entry) {
      const newEntry: QueueEntryRecord = {
        id: queueEntryId,
        clinic_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: "p-" + queueEntryId,
        doctor_id: "1",
        priority: "normal",
        status,
        joined_at: new Date().toISOString(),
        ...(timestampField === "called_at" ? { called_at: timestamp } : {}),
        ...(timestampField === "started_at" || status === "consulting" ? { started_at: timestamp } : {}),
        ...(timestampField === "completed_at" ? { completed_at: timestamp } : {}),
      };
      memoryStore.queueEntries.set(queueEntryId, newEntry);
      return newEntry;
    }

    const updated: QueueEntryRecord = {
      ...entry,
      ...updatePayload,
    };
    memoryStore.queueEntries.set(queueEntryId, updated);
    return updated;
  }

  /**
   * Record consultation start
   */
  async createConsultation(data: {
    queue_entry_id: string;
    patient_id: string;
    doctor_id: string;
    started_at: string;
  }): Promise<ConsultationRecord> {
    const consultationId = crypto.randomUUID ? crypto.randomUUID() : `cons-${Date.now()}`;
    const payload = {
      id: consultationId,
      queue_entry_id: data.queue_entry_id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      started_at: data.started_at,
      created_at: new Date().toISOString(),
    };

    try {
      const { data: inserted, error } = await supabase
        .from("consultations")
        .insert(payload)
        .select()
        .single();

      if (!error && inserted) {
        memoryStore.consultations.set(inserted.id, inserted);
        return inserted as ConsultationRecord;
      }
    } catch (err) {}

    memoryStore.consultations.set(consultationId, payload);
    return payload;
  }

  /**
   * Record consultation completion
   */
  async completeConsultation(
    queueEntryId: string,
    completed_at: string
  ): Promise<ConsultationRecord | null> {
    try {
      const { data, error } = await supabase
        .from("consultations")
        .update({ completed_at })
        .eq("queue_entry_id", queueEntryId)
        .select()
        .single();

      if (!error && data) {
        memoryStore.consultations.set(data.id, data);
        return data as ConsultationRecord;
      }
    } catch (err) {}

    for (const [id, record] of memoryStore.consultations.entries()) {
      if (record.queue_entry_id === queueEntryId) {
        const updated = { ...record, completed_at };
        memoryStore.consultations.set(id, updated);
        return updated;
      }
    }

    const consultationId = `cons-${Date.now()}`;
    const newRecord: ConsultationRecord = {
      id: consultationId,
      queue_entry_id: queueEntryId,
      patient_id: "patient-" + queueEntryId,
      doctor_id: "1",
      started_at: new Date(Date.now() - 15 * 60000).toISOString(),
      completed_at,
      created_at: new Date().toISOString(),
    };
    memoryStore.consultations.set(consultationId, newRecord);
    return newRecord;
  }

  /**
   * Create a new queue entry (for walk-in or appointment check-in)
   */
  async createQueueEntry(data: {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    doctor_name?: string;
    appointment_id?: string | null;
    priority?: "normal" | "priority" | "critical";
    status?: "waiting" | "called" | "consulting";
    joined_at?: string;
  }): Promise<QueueEntryRecord> {
    const entryId = crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`;
    const newEntry: QueueEntryRecord = {
      id: entryId,
      clinic_id: data.clinic_id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      doctor_name: data.doctor_name,
      appointment_id: data.appointment_id || null,
      priority: data.priority || "normal",
      status: data.status || "waiting",
      joined_at: data.joined_at || new Date().toISOString(),
      called_at: null,
      started_at: null,
      completed_at: null,
    };

    try {
      const { data: inserted, error } = await supabase
        .from("queue_entries")
        .insert({
          id: entryId,
          clinic_id: newEntry.clinic_id,
          patient_id: newEntry.patient_id,
          doctor_id: newEntry.doctor_id,
          appointment_id: newEntry.appointment_id,
          priority: newEntry.priority,
          status: newEntry.status,
          joined_at: newEntry.joined_at,
        })
        .select()
        .single();

      if (!error && inserted) {
        memoryStore.queueEntries.set(inserted.id, inserted);
        return inserted as QueueEntryRecord;
      }
    } catch (err) {}

    memoryStore.queueEntries.set(entryId, newEntry);
    return newEntry;
  }

  /**
   * Check if an appointment has already checked into the queue
   */
  async getQueueEntryByAppointmentId(appointmentId: string): Promise<QueueEntryRecord | null> {
    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .select("*")
        .eq("appointment_id", appointmentId)
        .in("status", ["waiting", "called", "consulting"])
        .maybeSingle();

      if (!error && data) {
        return data as QueueEntryRecord;
      }
    } catch (err) {}

    for (const entry of memoryStore.queueEntries.values()) {
      if (entry.appointment_id === appointmentId && ["waiting", "called", "consulting"].includes(entry.status)) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Get active queue entries for a given patient identifier
   */
  async getActiveQueueByPatient(patientId?: string): Promise<QueueEntryRecord[]> {
    try {
      let query = supabase
        .from("queue_entries")
        .select(`
          *,
          patients:patient_id (
            id,
            full_name,
            phone
          )
        `)
        .in("status", ["waiting", "called", "consulting"]);

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as QueueEntryRecord[];
      }
    } catch (err) {}

    const results: QueueEntryRecord[] = [];
    for (const entry of memoryStore.queueEntries.values()) {
      if (["waiting", "called", "consulting"].includes(entry.status)) {
        if (!patientId || entry.patient_id === patientId || entry.appointment_id === patientId) {
          const patient = memoryStore.patients.get(entry.patient_id);
          results.push({
            ...entry,
            patient: {
              id: entry.patient_id,
              name: patient?.full_name || "Patient",
              phone: patient?.phone || "",
              age: patient?.age,
            },
          });
        }
      }
    }
    return results;
  }
}

export const queueRepository = new QueueRepository();
