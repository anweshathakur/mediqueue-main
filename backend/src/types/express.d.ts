import { User } from "@supabase/supabase-js";

export type MediQueueRole = "patient" | "doctor" | "receptionist" | "staff" | "admin";

declare global {
  namespace Express {
    interface Request {
      user?: User | {
        id: string;
        email?: string;
        phone?: string;
        role?: MediQueueRole | string;
        appRole?: MediQueueRole | string;
        user_metadata?: Record<string, any>;
      };
    }
  }
}
