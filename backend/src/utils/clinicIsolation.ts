import { appointmentStore } from "../repositories/appointmentRepository";
import { memoryStore } from "../repositories/queueRepository";
import { supabase } from "../config/supabase";

export const CLINIC_A_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
export const CLINIC_B_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

/**
 * Checks if the caller has permission to access the target clinic.
 * System Admins can access any clinic.
 * Regular Doctors/Staff can ONLY access their own clinic.
 */
export function hasClinicAccess(reqUser: any, targetClinicId?: string | null): boolean {
  if (!reqUser) return false;

  const role = (
    reqUser.appRole ||
    reqUser.role ||
    reqUser.user_metadata?.role ||
    "patient"
  ).toLowerCase();

  // Global system admin has cross-clinic visibility
  if (role === "admin") {
    return true;
  }

  // Patients don't manage clinics directly
  if (role === "patient") {
    return true;
  }

  // Doctors / Receptionists / Staff must match their assigned clinic
  const userClinicId = reqUser.clinic_id || reqUser.user_metadata?.clinic_id || CLINIC_A_ID;
  if (!targetClinicId) return true;

  return userClinicId === targetClinicId;
}

/**
 * Resolves a doctor's clinic ID
 */
export async function getDoctorClinicId(doctorId: string): Promise<string | null> {
  const doc = appointmentStore.doctors.get(doctorId);
  if (doc) return doc.clinic_id;

  try {
    const { data } = await supabase
      .from("doctors")
      .select("clinic_id")
      .eq("id", doctorId)
      .maybeSingle();

    if (data?.clinic_id) return data.clinic_id;
  } catch {}

  return null;
}

/**
 * Resolves a queue entry's clinic ID
 */
export async function getQueueEntryClinicId(queueEntryId: string): Promise<string | null> {
  const q = memoryStore.queueEntries.get(queueEntryId);
  if (q) return q.clinic_id;

  try {
    const { data } = await supabase
      .from("queue_entries")
      .select("clinic_id")
      .eq("id", queueEntryId)
      .maybeSingle();

    if (data?.clinic_id) return data.clinic_id;
  } catch {}

  return null;
}
