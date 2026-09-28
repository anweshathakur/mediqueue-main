import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { supabase } from "./src/config/supabase";
import walkInRoutes from "./src/routes/walkInRoutes";
import queueRoutes from "./src/routes/queueRoutes";
import apiRouter from "./src/routes/index";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "MediQueue Backend API Engine",
        version: "1.0.0",
        frontend_url: "http://localhost:5174",
        endpoints: {
            health: "/health",
            test_db: "/test-db",
            doctor_queue: "/api/queue/:doctorId",
            walk_ins: "/api/walk-ins"
        }
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "MediQueue backend is running"
    });
});

app.get("/test-db", async (req, res) => {
    const { data, error } = await supabase
        .from("clinics")
        .select("id")
        .limit(1);

    if (error) {
        return res.status(500).json({
            connected: false,
            error: error.message
        });
    }

    res.json({
        connected: true,
        message: "Backend is connected to Supabase",
        data
    });
});

app.use("/api/queue", queueRoutes);
app.use("/api/walk-ins", walkInRoutes);
app.use("/api/walkins", walkInRoutes);
app.use("/api", apiRouter);

export default app;