import { z } from "zod";

export const QueueEntryIdParamSchema = z.object({
  queueEntryId: z.string({ required_error: "queueEntryId is required" }).min(1, "queueEntryId cannot be empty"),
});

export const DoctorIdParamSchema = z.object({
  doctorId: z.string({ required_error: "doctorId is required" }).min(1, "doctorId cannot be empty"),
});
