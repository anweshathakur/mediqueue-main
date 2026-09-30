import { Request } from "express";

export function isOwnerOrPrivileged(
  reqUser: any,
  resourceOwnerId?: string | null,
  resourceOwnerEmail?: string | null
): boolean {
  if (!reqUser) return false;

  const role = (
    reqUser.appRole ||
    reqUser.role ||
    reqUser.user_metadata?.role ||
    "patient"
  ).toLowerCase();

  // Admins, Receptionists, and Staff are privileged users who can manage clinic operations
  if (role === "admin" || role === "receptionist" || role === "staff") {
    return true;
  }

  const userId = reqUser.id;
  const userEmail = reqUser.email ? reqUser.email.toLowerCase() : "";

  // Direct match on user ID
  if (resourceOwnerId && (resourceOwnerId === userId || resourceOwnerId.toLowerCase() === userEmail)) {
    return true;
  }

  // Direct match on email
  if (resourceOwnerEmail && userEmail && resourceOwnerEmail.toLowerCase() === userEmail) {
    return true;
  }

  // Demo user equivalence handling
  if (
    userEmail === "demo123@gmail.com" &&
    (resourceOwnerId === "patient_demo123" ||
      resourceOwnerId === "demo-user-101" ||
      resourceOwnerId === "demo123@gmail.com" ||
      resourceOwnerEmail === "demo123@gmail.com")
  ) {
    return true;
  }

  return false;
}
