import { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      user?: User | {
        id: string;
        email?: string;
        phone?: string;
        role?: string;
        user_metadata?: Record<string, any>;
      };
    }
  }
}
