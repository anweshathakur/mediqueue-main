import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { supabase } from "./src/config/supabase";
import walkInRoutes from "./src/routes/walkInRoutes";
import queueRoutes from "./src/routes/queueRoutes";
import appointmentRoutes from "./src/routes/appointmentRoutes";
import notificationRoutes from "./src/routes/notificationRoutes";
import apiRouter from "./src/routes/index";
import { appointmentController } from "./src/controllers/appointmentController";
import { generalLimiter, sensitiveActionLimiter } from "./src/middleware/rateLimitMiddleware";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler";

const app = express();

// 1. Security HTTP Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Whitelist Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly fallback
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-demo-role", "x-demo-clinic"],
}));

// 3. Request Body Size Limits (1MB cap)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. Rate Limiting
app.use(generalLimiter);

// 5. System Health & Public Endpoints
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "MediQueue Backend API Engine",
    version: "1.0.0",
    frontend_url: process.env.FRONTEND_URL || "http://localhost:5174",
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

app.get("/test-db", async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

// 6. Application Routes (with sensitive limiter on mutations)
app.use("/api/queue", queueRoutes);
app.use("/api/walk-ins", sensitiveActionLimiter, walkInRoutes);
app.use("/api/walkins", sensitiveActionLimiter, walkInRoutes);
app.use("/api/appointments", sensitiveActionLimiter, appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/api/clinics", (req, res) => appointmentController.getClinics(req, res));
app.get("/api/doctors", (req, res) => appointmentController.getDoctors(req, res));
app.use("/api", apiRouter);

// 7. 404 Catch-All Handler
app.use(notFoundHandler);

// 8. Centralized Safe Error Handler
app.use(errorHandler);

export default app;
