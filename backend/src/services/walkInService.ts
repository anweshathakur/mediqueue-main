import {
    createPatient,
    createQueueEntry
} from "../repositories/walkInRepository";

export async function registerWalkIn(data: {
    name: string;
    phone: string;
    clinic_id?: string;
    doctor_id?: string;
    priority?: "normal" | "priority" | "critical" | string;
}) {
    const patient = await createPatient({
        full_name: data.name,
        phone: data.phone
    });

    const priorityValue = data.priority === "critical"
        ? "critical"
        : data.priority === "priority"
        ? "priority"
        : "normal";

    const queueEntry = await createQueueEntry({
        clinic_id: data.clinic_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        patient_id: patient.id,
        doctor_id: data.doctor_id || "1",
        priority: priorityValue
    });

    return {
        patient,
        queueEntry
    };
}