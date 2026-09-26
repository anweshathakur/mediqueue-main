import { Request, Response } from "express";
import { registerWalkIn } from "../services/walkInService";

export async function createWalkIn(req: Request, res: Response) {
    try {
        const {
            name,
            phone,
            clinic_id,
            doctor_id,
            priority
        } = req.body;

        if (!name || !phone || !clinic_id || !doctor_id) {
            return res.status(400).json({
                message: "Name, phone, clinic_id and doctor_id are required"
            });
        }

        const result = await registerWalkIn({
            name,
            phone,
            clinic_id,
            doctor_id,
            priority
        });

        return res.status(201).json({
            message: "Walk-in registered successfully",
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