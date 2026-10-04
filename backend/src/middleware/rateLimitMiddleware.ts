import rateLimit from "express-rate-limit";

/**
 * General API Rate Limiter
 * 200 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too Many Requests",
    message: "Rate limit exceeded. Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Sensitive Mutation Rate Limiter (Walk-ins, Bookings, Check-ins)
 * 60 requests per 15 minutes per IP
 */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too Many Requests",
    message: "Action rate limit exceeded. Please wait a few minutes before submitting again.",
  },
});
