import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { supabase } from "./src/config/supabase";
import walkInRoutes from "./src/routes/walkInRoutes";

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/api/walk-ins", walkInRoutes);

export default app;