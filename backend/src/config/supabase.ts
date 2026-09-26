import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded before reading
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        `Missing Supabase environment variables. Please check that SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.`
    );
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);