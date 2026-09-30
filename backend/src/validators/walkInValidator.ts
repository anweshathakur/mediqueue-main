import { z } from "zod";

export const CreateWalkInSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot exceed 100 characters").optional(),
  patient_name: z.string().min(1, "Patient name cannot be empty").max(100, "Patient name cannot exceed 100 characters").optional(),
  phone: z.string({ required_error: "phone is required" }).min(7, "Phone number must be at least 7 digits").max(20, "Phone number cannot exceed 20 characters"),
  doctor_id: z.string().min(1).optional(),
  doctor_name: z.string().max(100).optional(),
  clinic_id: z.string().optional(),
  priority: z.union([
    z.enum(["normal", "priority", "critical"], {
      errorMap: () => ({ message: "Priority must be 'normal', 'priority', or 'critical'" }),
    }),
    z.boolean(),
  ]).optional(),
  age: z.union([z.number().int().min(0).max(150), z.string()]).optional(),
}).refine((data) => data.name || data.patient_name, {
  message: "Either 'name' or 'patient_name' is required",
  path: ["name"],
});
