import {
    createPatient,
    createQueueEntry
} from "../repositories/walkInRepository";

export async function registerWalkIn(data: {
    name: string;
    phone: string;
    clinic_id: string;
    doctor_id: string;
    priority?: string;
}) {
    const patient = await createPatient({
        full_name: data.name,
        phone: data.phone
    });

    const queueEntry = await createQueueEntry({
        clinic_id: data.clinic_id,
        patient_id: patient.id,
        doctor_id: data.doctor_id,
        priority: data.priority || "normal"
    });

    return {
        patient,
        queueEntry
    };
}