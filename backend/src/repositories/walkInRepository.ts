import { supabase } from "../config/supabase";

export async function createPatient(patient: {
    full_name: string;
    phone: string;
}) {
    const { data, error } = await supabase
        .from("patients")
        .insert({
            full_name: patient.full_name,
            phone: patient.phone
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function createQueueEntry(queueEntry: {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    priority: string;
}) {
    const { data, error } = await supabase
        .from("queue_entries")
        .insert({
            clinic_id: queueEntry.clinic_id,
            patient_id: queueEntry.patient_id,
            doctor_id: queueEntry.doctor_id,
            priority: queueEntry.priority
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}