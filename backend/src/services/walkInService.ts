import { auditService } from "./auditService";
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
    [key: string]: any;
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

    await auditService.log({
        clinicId: data.clinic_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        action: "WALKIN_REGISTERED",
        resourceType: "walk_in",
        resourceId: queueEntry.id,
        metadata: {
            patient_id: patient.id,
            doctor_id: queueEntry.doctor_id,
            priority: priorityValue,
            ...data
        },
    });

    return {
        patient,
        queueEntry
    };
}
