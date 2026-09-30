import { supabase } from "../config/supabase";
import crypto from "crypto";

export interface NotificationRecord {
  id: string;
  patient_id: string;
  appointment_id?: string | null;
  queue_entry_id?: string | null;
  channel: "in_app" | "sms" | "push";
  title?: string;
  message: string;
  status: "unread" | "read";
  read_at?: string | null;
  created_at: string;
}

export const notificationMemoryStore = new Map<string, NotificationRecord>([
  [
    "notif-1",
    {
      id: "notif-1",
      patient_id: "demo123@gmail.com",
      channel: "in_app",
      title: "Appointment Confirmed",
      message: "Your appointment with Dr. Arjun Mehta is confirmed for 11:00 AM.",
      status: "read",
      read_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  [
    "notif-2",
    {
      id: "notif-2",
      patient_id: "demo123@gmail.com",
      channel: "in_app",
      title: "Checked In to Live Queue",
      message: "You are #4 in the queue with Dr. Arjun Mehta (Room 204).",
      status: "unread",
      read_at: null,
      created_at: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  [
    "notif-3",
    {
      id: "notif-3",
      patient_id: "demo123@gmail.com",
      channel: "in_app",
      title: "Queue Progression",
      message: "You are now #2 in the queue. Estimated wait: ~14 mins.",
      status: "unread",
      read_at: null,
      created_at: new Date(Date.now() - 180000).toISOString(),
    },
  ],
]);

export class NotificationRepository {
  async createNotification(payload: {
    patient_id: string;
    appointment_id?: string | null;
    queue_entry_id?: string | null;
    channel?: "in_app" | "sms" | "push";
    title?: string;
    message: string;
  }): Promise<NotificationRecord> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const record: NotificationRecord = {
      id,
      patient_id: payload.patient_id,
      appointment_id: payload.appointment_id || null,
      queue_entry_id: payload.queue_entry_id || null,
      channel: payload.channel || "in_app",
      title: payload.title || "Queue Notification",
      message: payload.message,
      status: "unread",
      read_at: null,
      created_at,
    };

    notificationMemoryStore.set(id, record);

    try {
      await supabase.from("notifications").insert([
        {
          id,
          patient_id: payload.patient_id,
          appointment_id: payload.appointment_id || null,
          queue_entry_id: payload.queue_entry_id || null,
          channel: payload.channel || "in_app",
          message: payload.message,
          status: "pending",
          created_at,
        },
      ]);
    } catch (err) {
      console.warn("Supabase notification insert notice:", err);
    }

    return record;
  }

  async getNotificationById(id: string): Promise<NotificationRecord | null> {
    const record = notificationMemoryStore.get(id);
    if (record) return record;

    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          patient_id: data.patient_id,
          appointment_id: data.appointment_id,
          queue_entry_id: data.queue_entry_id,
          channel: data.channel || "in_app",
          title: data.title || "Queue Notification",
          message: data.message,
          status: data.status === "read" ? "read" : "unread",
          read_at: data.read_at,
          created_at: data.created_at,
        };
      }
    } catch {}

    return null;
  }

  async getNotificationsByPatient(patientIdentifier?: string): Promise<NotificationRecord[]> {
    const all = Array.from(notificationMemoryStore.values());

    if (!patientIdentifier) {
      return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const filtered = all.filter(
      (n) =>
        n.patient_id === patientIdentifier ||
        n.patient_id.toLowerCase() === patientIdentifier.toLowerCase()
    );

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markAsRead(notificationId: string): Promise<NotificationRecord | null> {
    const item = notificationMemoryStore.get(notificationId);
    if (!item) return null;

    item.status = "read";
    item.read_at = new Date().toISOString();
    notificationMemoryStore.set(notificationId, item);
    return item;
  }

  async markAllAsRead(patientIdentifier?: string): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();

    for (const [id, item] of notificationMemoryStore.entries()) {
      if (
        !patientIdentifier ||
        item.patient_id === patientIdentifier ||
        item.patient_id.toLowerCase() === patientIdentifier.toLowerCase()
      ) {
        if (item.status !== "read") {
          item.status = "read";
          item.read_at = now;
          notificationMemoryStore.set(id, item);
          count++;
        }
      }
    }
    return count;
  }
}

export const notificationRepository = new NotificationRepository();
