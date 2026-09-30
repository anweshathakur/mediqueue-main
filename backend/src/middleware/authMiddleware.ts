import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export type MediQueueRole = "patient" | "doctor" | "receptionist" | "staff" | "admin";

/**
 * Normalizes role names (e.g. 'staff' is treated as 'receptionist')
 */
export function normalizeRole(role?: string): string {
  if (!role) return "patient";
  const r = role.toLowerCase().trim();
  if (r === "staff") return "receptionist";
  return r;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required. Missing Bearer token in Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.trim() === "" || token === "null" || token === "undefined") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication token is empty or invalid.",
    });
  }

  try {
    // 1. Allow development / demo token bypass if testing or demoing
    if (token.startsWith("demo-token") || token === "demo@123") {
      let role = "patient";
      if (token.includes("doctor")) role = "doctor";
      else if (token.includes("receptionist") || token.includes("staff")) role = "receptionist";
      else if (token.includes("admin")) role = "admin";
      
      const customRole = req.headers["x-demo-role"] as string;
      if (customRole) {
        role = customRole;
      }

      req.user = {
        id: `demo-${role}-101`,
        email: `demo_${role}@mediqueue.com`,
        role: normalizeRole(role),
        appRole: normalizeRole(role),
        user_metadata: { name: `Demo ${role.toUpperCase()}`, role: normalizeRole(role) },
      } as any;

      return next();
    }

    // 2. Ask Supabase to verify the JWT token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired authentication token.",
        details: error?.message,
      });
    }

    // 3. Resolve user's actual MediQueue role (DB table takes precedence over user_metadata)
    let role = data.user.user_metadata?.role || "patient";

    try {
      const { data: dbUser } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", data.user.id)
        .maybeSingle();

      if (dbUser?.role) {
        role = dbUser.role;
      }
    } catch {
      // If DB query is unavailable, fallback to metadata role
    }

    const normalizedRole = normalizeRole(role);

    // 4. Attach verified user & normalized role to request
    req.user = {
      ...data.user,
      role: normalizedRole,
      appRole: normalizedRole,
    } as any;

    return next();
  } catch (err: any) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication verification failed: " + (err.message || "Unknown error"),
    });
  }
}

/**
 * Role-Based Access Control Middleware
 * Requires the authenticated user to have at least one of the specified roles.
 * Admins are granted full access across all endpoints.
 */
export function requireRole(...allowedRoles: string[]) {
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required before checking permissions.",
      });
    }

    const userRole = normalizeRole((req.user as any).appRole || (req.user as any).role || req.user.user_metadata?.role);

    // Admins have universal superuser access
    if (userRole === "admin") {
      return next();
    }

    if (normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: "Forbidden",
      message: `Access denied. Requires one of [${allowedRoles.join(", ")}], but your role is '${userRole}'.`,
      currentRole: userRole,
      requiredRoles: allowedRoles,
    });
  };
}
