import { z } from "zod";

export const NotificationIdParamSchema = z.object({
  id: z.string({ required_error: "Notification ID is required" }).min(1, "Notification ID cannot be empty"),
});
