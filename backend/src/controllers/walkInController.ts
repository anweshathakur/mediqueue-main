import { Request, Response } from "express";
import { registerWalkIn } from "../services/walkInService";

export async function createWalkIn(req: Request, res: Response) {
    try {
        const {
            name,
            patient_name,
            phone,
            clinic_id,
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

        const result = await registerWalkIn({
            name: resolvedName,
            phone,
            clinic_id: clinic_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            doctor_id: doctor_id ? String(doctor_id) : "1",
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