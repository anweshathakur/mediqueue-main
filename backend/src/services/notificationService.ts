import { notificationRepository, NotificationRecord } from "../repositories/notificationRepository";
import { supabase } from "../config/supabase";

export class NotificationService {
  /**
   * Create an in-app notification & broadcast event live over Supabase Realtime
   */
  async createNotification(payload: {
    patient_id: string;
    appointment_id?: string | null;
    queue_entry_id?: string | null;
    channel?: "in_app" | "sms" | "push";
    title?: string;
    message: string;
  }): Promise<NotificationRecord> {
    const notif = await notificationRepository.createNotification(payload);

    // Broadcast live over Realtime channel
    try {
      const channel = supabase.channel("mediqueue-live-events");
      await channel.send({
        type: "broadcast",
        event: "notification_created",
        payload: { notification: notif },
      });
    } catch (e) {}

    return notif;
  }

  async getPatientNotifications(patientIdentifier?: string): Promise<NotificationRecord[]> {
    return notificationRepository.getNotificationsByPatient(patientIdentifier);
  }

  async markAsRead(notificationId: string): Promise<NotificationRecord | null> {
    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(patientIdentifier?: string): Promise<{ count: number }> {
    const count = await notificationRepository.markAllAsRead(patientIdentifier);
    return { count };
  }

  // --- Domain Event Triggers ---

  async notifyAppointmentConfirmed(appointment: {
    patient_id?: string;
    patient_name?: string;
    doctor_name?: string;
    scheduled_at?: string;
    appointment_id?: string;
  }) {
    const patientId = appointment.patient_id || "demo123@gmail.com";
    const docName = appointment.doctor_name || "Dr. Arjun Mehta";
    const timeStr = appointment.scheduled_at
      ? new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "3:00 PM";

    return this.createNotification({
      patient_id: patientId,
      appointment_id: appointment.appointment_id,
      title: "Appointment Confirmed",
      message: `You have an appointment with ${docName} at ${timeStr}.`,
    });
  }

  async notifyCheckedIn(queueEntry: {
    id: string;
    patient_id: string;
    doctor_name?: string;
    position?: number;
    room_number?: string;
  }) {
    const patientId = queueEntry.patient_id || "demo123@gmail.com";
    const pos = queueEntry.position || 1;
    const docName = queueEntry.doctor_name || "Dr. Arjun Mehta";
    const room = queueEntry.room_number || "Room 204";

    return this.createNotification({
      patient_id: patientId,
      queue_entry_id: queueEntry.id,
      title: "Checked In to Live Queue",
      message: `You are #${pos} in the queue with ${docName} (${room}).`,
    });
  }

  async notifyPositionMoved(queueEntry: {
    id: string;
    patient_id: string;
    position: number;
    estimatedWait?: string;
  }) {
    const patientId = queueEntry.patient_id || "demo123@gmail.com";
    const wait = queueEntry.estimatedWait ? ` Estimated wait: ${queueEntry.estimatedWait}.` : "";

    return this.createNotification({
      patient_id: patientId,
      queue_entry_id: queueEntry.id,
      title: "Queue Update",
      message: `You are now #${queueEntry.position} in the queue.${wait}`,
    });
  }

  async notifyPatientCalled(queueEntry: {
    id: string;
    patient_id: string;
    doctor_name?: string;
    room_number?: string;
  }) {
    const patientId = queueEntry.patient_id || "demo123@gmail.com";
    const docName = queueEntry.doctor_name || "Dr. Arjun Mehta";
    const room = queueEntry.room_number || "Room 204";

    return this.createNotification({
      patient_id: patientId,
      queue_entry_id: queueEntry.id,
      title: "Doctor Calling Your Token",
      message: `${docName} has called you. Please proceed to ${room}.`,
    });
  }

  async notifyConsultationCompleted(queueEntry: {
    id: string;
    patient_id: string;
    doctor_name?: string;
  }) {
    const patientId = queueEntry.patient_id || "demo123@gmail.com";
    const docName = queueEntry.doctor_name || "Dr. Arjun Mehta";

    return this.createNotification({
      patient_id: patientId,
      queue_entry_id: queueEntry.id,
      title: "Consultation Completed",
      message: `Your consultation with ${docName} has been completed. Prescriptions & telemetry logged.`,
    });
  }
}

export const notificationService = new NotificationService();
