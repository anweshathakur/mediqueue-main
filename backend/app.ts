import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./src/config/supabase";
import routes from "./src/routes";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", routes);

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "MediQueue backend is running"
    });
});

// Database connectivity test endpoint
app.get(["/test-db", "/api/test-db"], async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Try querying clinics or doctors
        const { data, error, count } = await supabase
            .from("clinics")
            .select("*", { count: "exact" })
            .limit(5);

        const latencyMs = Date.now() - startTime;

        // If table doesn't exist yet, it still confirms Supabase project is reachable!
        if (error && error.code === 'PGRST205') {
            return res.status(200).json({
                status: "connected",
                message: "Connected to Supabase successfully!",
                note: "The 'clinics' table was not found in your Supabase database schema yet. Please run the SQL files from the 'database/schema/' folder in your Supabase SQL Editor.",
                supabaseUrl: process.env.SUPABASE_URL,
                latency: `${latencyMs}ms`,
                details: error.message
            });
        }

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Failed to query table",
                error: error.message,
                code: error.code
            });
        }

        res.status(200).json({
            status: "success",
            message: "Successfully connected to Supabase and queried tables!",
            latency: `${latencyMs}ms`,
            tableTested: "clinics",
            recordCount: count ?? data?.length ?? 0,
            sampleRecords: data
        });
    } catch (err: any) {
        res.status(500).json({
            status: "error",
            message: "Supabase connection exception",
            error: err.message
        });
    }
});

export default app;