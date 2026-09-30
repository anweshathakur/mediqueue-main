import { z } from "zod";

export const BookAppointmentSchema = z.object({
  clinic_id: z.string({ required_error: "clinic_id is required" }).min(1, "clinic_id cannot be empty"),
  doctor_id: z.string({ required_error: "doctor_id is required" }).min(1, "doctor_id cannot be empty"),
  scheduled_at: z
    .string({ required_error: "scheduled_at is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "scheduled_at must be a valid ISO date-time string",
    }),
  reason: z.string().max(500, "reason cannot exceed 500 characters").optional(),
  patient_id: z.string().optional(),
  patient_name: z.string().min(1).max(100, "patient_name cannot exceed 100 characters").optional(),
  patient_phone: z.string().min(7, "phone must be at least 7 digits").max(20, "phone cannot exceed 20 characters").optional(),
});

export const RescheduleAppointmentSchema = z.object({
  scheduled_at: z
    .string({ required_error: "scheduled_at is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "scheduled_at must be a valid ISO date-time string",
    }),
});

export const AppointmentIdParamSchema = z.object({
  id: z.string({ required_error: "Appointment ID parameter is required" }).min(1, "Appointment ID cannot be empty"),
});
