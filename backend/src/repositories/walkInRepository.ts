import { supabase } from "../config/supabase";
import { memoryStore } from "./queueRepository";
import crypto from "crypto";

export async function createPatient(patient: {
    full_name: string;
    phone: string;
    age?: number;
}) {
    const patientId = crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;
    const patientRecord = {
        id: patientId,
        full_name: patient.full_name,
        phone: patient.phone,
        age: patient.age || 30,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from("patients")
            .insert({
                id: patientId,
                full_name: patient.full_name,
                phone: patient.phone
            })
            .select()
            .single();

        if (!error && data) {
            memoryStore.patients.set(data.id, { ...patientRecord, id: data.id });
            return data;
        }
    } catch (err) {}

    memoryStore.patients.set(patientId, patientRecord);
    return patientRecord;
}

export async function createQueueEntry(queueEntry: {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    priority: "normal" | "priority" | "critical";
}) {
    const entryId = crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`;
    const entryRecord = {
        id: entryId,
        clinic_id: queueEntry.clinic_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: queueEntry.patient_id,
        doctor_id: queueEntry.doctor_id || "1",
        priority: queueEntry.priority || "normal",
        status: "waiting" as const,
        joined_at: new Date().toISOString(),
        called_at: null,
        completed_at: null
    };

    try {
        const { data, error } = await supabase
            .from("queue_entries")
            .insert({
                id: entryId,
                clinic_id: entryRecord.clinic_id,
                patient_id: entryRecord.patient_id,
                doctor_id: entryRecord.doctor_id,
                priority: entryRecord.priority
            })
            .select()
            .single();

        if (!error && data) {
            memoryStore.queueEntries.set(data.id, { ...entryRecord, id: data.id });
            return data;
        }
    } catch (err) {}

    memoryStore.queueEntries.set(entryId, entryRecord);
    return entryRecord;
}
