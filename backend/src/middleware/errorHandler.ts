import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Error Handling Middleware
 * - Logs technical details server-side
 * - Never leaks stack traces, database schema info, or internal errors to clients in production
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log real technical error on server
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  if (err.stack && process.env.NODE_ENV !== "test") {
    console.error(err.stack);
  }

  // Handle Payload Too Large (e.g. from express.json limit)
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      error: "Payload Too Large",
      message: "Request entity too large. Maximum allowed size is 1MB.",
    });
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Malformed JSON payload.",
    });
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : typeof err.status === "number" ? err.status : 500;

  // Safe client message for 500s
  let clientMessage = err.message || "An unexpected error occurred.";
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    clientMessage = "Internal server error. Please contact support.";
  }

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : "Error",
    message: clientMessage,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Catch-all Handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};
