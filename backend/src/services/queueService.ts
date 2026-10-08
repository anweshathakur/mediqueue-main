import { auditService } from "./auditService";
import { queueRepository, QueueEntryRecord, ConsultationRecord } from "../repositories/queueRepository";
import { appointmentStore } from "../repositories/appointmentRepository";
import { etaService } from "./etaService";
import { notificationService } from "./notificationService";

export interface QueueItemResponse {
  id: string;
  position: number;
  patient: {
    id: string;
    name: string;
    phone: string;
    age?: number;
  };
  doctor_id: string;
  doctor_name?: string;
  priority: "normal" | "priority" | "critical";
  status: "waiting" | "called" | "consulting" | "completed" | "no_show" | "cancelled";
  joined_at: string;
  called_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export class QueueService {
  /**
   * Calculate effective queue dynamically based on priority and joined_at
   * 1. Critical (Rank 1)
   * 2. Priority (Rank 2)
   * 3. Normal (Rank 3)
   * Within each priority: earlier joined_at -> earlier position
   * Note: Active (consulting/called) patients are pinned at the top.
   */
  async getDoctorQueue(doctorId: string): Promise<QueueItemResponse[]> {
    const rawEntries = await queueRepository.getQueueByDoctorId(doctorId);

    // Priority rank mapper
    const getPriorityRank = (p: string): number => {
      const lower = (p || "normal").toLowerCase();
      if (lower === "critical") return 1;
      if (lower === "priority") return 2;
      return 3; // normal
    };

    // Status rank: consulting (0), called (1), waiting (2)
    const getStatusRank = (s: string): number => {
      const lower = (s || "").toLowerCase();
      if (lower === "consulting") return 0;
      if (lower === "called") return 1;
      return 2;
    };

    const sorted = [...rawEntries].sort((a, b) => {
      const statusRankA = getStatusRank(a.status);
      const statusRankB = getStatusRank(b.status);

      // Active consultation / called stays at top
      if (statusRankA !== statusRankB) {
        return statusRankA - statusRankB;
      }

      // Priority ordering: Critical (1) > Priority (2) > Normal (3)
      const priorityRankA = getPriorityRank(a.priority);
      const priorityRankB = getPriorityRank(b.priority);

      if (priorityRankA !== priorityRankB) {
        return priorityRankA - priorityRankB;
      }

      // Within same priority: earlier joined_at -> earlier position
      const timeA = new Date(a.joined_at).getTime();
      const timeB = new Date(b.joined_at).getTime();
      return timeA - timeB;
    });

    // Calculate dynamic position on the fly without DB storage
    return sorted.map((entry, index) => ({
      id: entry.id,
      position: index + 1,
      patient: {
        id: entry.patient?.id || entry.patient_id,
        name: entry.patient?.name || "Patient",
        phone: entry.patient?.phone || "",
        age: entry.patient?.age,
      },
      doctor_id: entry.doctor_id,
      doctor_name: entry.doctor_name,
      priority: entry.priority,
      status: entry.status,
      joined_at: entry.joined_at,
      called_at: entry.called_at,
      started_at: entry.started_at,
      completed_at: entry.completed_at,
    }));
  }

    /**
   * Action: Call next patient (waiting -> called)
   */
  async callNextPatient(queueEntryId: string): Promise<QueueEntryRecord> {
    const entry = await queueRepository.getQueueEntryById(queueEntryId);
    if (!entry) {
      throw new Error(`Queue entry ${queueEntryId} not found`);
    }

    if (entry.status === "completed" || entry.status === "cancelled") {
      throw new Error(`Cannot call patient with status: ${entry.status}`);
    }

    const updated = await queueRepository.updateStatus(queueEntryId, "called", "called_at");
    auditService.log({
      clinicId: entry.clinic_id,
      action: "QUEUE_CALLED",
      resourceType: "queue_entry",
      resourceId: queueEntryId,
      metadata: { doctor_id: entry.doctor_id, old_status: entry.status, new_status: "called" },
    });
    try {
      await notificationService.notifyCalled({
        id: updated.id,
        patient_id: updated.patient_id,
        doctor_name: updated.doctor_name || "Dr. Arjun Mehta",
        room_number: "Room 204",
      });
    } catch (e) {}
    return updated;
  }

  /**
   * Action: Start consultation (called/waiting -> consulting)
   */
  async startConsultation(queueEntryId: string): Promise<{
    queueEntry: QueueEntryRecord;
    consultation: ConsultationRecord;
  }> {
    const entry = await queueRepository.getQueueEntryById(queueEntryId);
    if (!entry) {
      throw new Error(`Queue entry ${queueEntryId} not found`);
    }

    if (entry.status === "completed" || entry.status === "cancelled") {
      throw new Error(`Cannot start consultation for an entry with status: ${entry.status}`);
    }

    const started_at = new Date().toISOString();
    const updatedQueueEntry = await queueRepository.updateStatus(queueEntryId, "consulting", "started_at");
    auditService.log({
      clinicId: entry.clinic_id,
      action: "QUEUE_STARTED",
      resourceType: "queue_entry",
      resourceId: queueEntryId,
      metadata: { doctor_id: entry.doctor_id, old_status: entry.status, new_status: "consulting" },
    });
    auditService.log({
      clinicId: entry.clinic_id,
      action: "CONSULTATION_STARTED",
      resourceType: "consultation",
      resourceId: queueEntryId,
      metadata: { doctor_id: entry.doctor_id, patient_id: entry.patient_id },
    });

    const consultation = await queueRepository.createConsultation({
      queue_entry_id: queueEntryId,
      patient_id: entry.patient_id,
      doctor_id: entry.doctor_id,
      started_at,
    });

    return {
      queueEntry: updatedQueueEntry,
      consultation,
    };
  }

  /**
   * Action: Complete consultation (consulting -> completed)
   * State machine: rejects direct skipping from waiting to completed
   */
  async completeConsultation(queueEntryId: string): Promise<{
    queueEntry: QueueEntryRecord;
    consultation: ConsultationRecord | null;
  }> {
    const entry = await queueRepository.getQueueEntryById(queueEntryId);
    if (!entry) {
      throw new Error(`Queue entry ${queueEntryId} not found`);
    }

    if (entry.status === "waiting") {
      throw new Error("Invalid state transition: Cannot complete consultation directly from status: waiting. Expected lifecycle: waiting -> called -> consulting -> completed.");
    }

    if (entry.status === "completed") {
      throw new Error("Consultation is already completed.");
    }

    const completed_at = new Date().toISOString();

    const updatedQueueEntry = await queueRepository.updateStatus(
      queueEntryId,
      "completed",
      "completed_at"
    );
    auditService.log({
      clinicId: entry.clinic_id,
      action: "QUEUE_COMPLETED",
      resourceType: "queue_entry",
      resourceId: queueEntryId,
      metadata: { doctor_id: entry.doctor_id, old_status: entry.status, new_status: "completed" },
    });
    auditService.log({
      clinicId: entry.clinic_id,
      action: "CONSULTATION_COMPLETED",
      resourceType: "consultation",
      resourceId: queueEntryId,
      metadata: { doctor_id: entry.doctor_id, patient_id: entry.patient_id },
    });

    const consultation = await queueRepository.completeConsultation(
      queueEntryId,
      completed_at
    );

    try {
      await notificationService.notifyCompleted({
        id: updatedQueueEntry.id,
        patient_id: updatedQueueEntry.patient_id,
        doctor_name: updatedQueueEntry.doctor_name || "Dr. Arjun Mehta",
      });
    } catch (e) {}

    return {
      queueEntry: updatedQueueEntry,
      consultation,
    };
  }


  /**
   * Get patient's live queue status with deterministic ETA calculation
   */
  async getMyQueueStatus(patientIdentifier?: string) {
    const activeEntries = await queueRepository.getActiveQueueByPatient(patientIdentifier);
    if (!activeEntries || activeEntries.length === 0) {
      return {
        hasActiveQueue: false,
        message: "No active queue entry found",
      };
    }

    // Pick the active queue entry
    const entry = activeEntries[0];

    // Get doctor's full live queue
    const doctorQueue = await this.getDoctorQueue(entry.doctor_id);

    // Dynamic queue position
    const myIndex = doctorQueue.findIndex((q) => q.id === entry.id);
    const position = myIndex !== -1 ? myIndex + 1 : 1;
    const peopleAhead = Math.max(0, position - 1);

    // Active consulting patient
    const consultingPatient = doctorQueue.find((q) => q.status === "consulting");

    const currentlySeeing = consultingPatient
      ? `#${consultingPatient.position} (${consultingPatient.patient.name})`
      : doctorQueue.find((q) => q.status === "called")
      ? "Called to Room"
      : "Next in line";

    // Compute dynamic ETA (ML Service with deterministic fallback)
    const etaResult = await etaService.calculateEta({
      doctorId: entry.doctor_id,
      patientPriority: entry.priority,
      peopleAhead,
      activeConsultationStartedAt: consultingPatient?.started_at,
      avgConsultationMinutes: 12,
      isAppointment: Boolean(entry.appointment_id),
    });

    // Doctor details
    const doctor = appointmentStore.doctors.get(entry.doctor_id) || {
      id: entry.doctor_id,
      name: entry.doctor_name || "Dr. Arjun Mehta",
      specialty: "General Medicine",
      room_number: "Room 204",
      clinic_id: entry.clinic_id,
      status: "available" as const,
    };

    // Clinic details
    const clinic = appointmentStore.clinics.get(entry.clinic_id) || {
      id: entry.clinic_id,
      name: "MUJ Health Centre",
      address: "100 Medical Blvd, Jaipur, Rajasthan",
      phone: "+91 (555) 019-2834",
    };

    return {
      hasActiveQueue: true,
      queueEntry: {
        id: entry.id,
        position,
        peopleAhead,
        currentlySeeing,
        estimatedWait: etaResult.estimatedWaitFormatted,
        estimatedWaitMins: etaResult.estimatedWaitMinutes,
        status: entry.status,
        priority: entry.priority,
        joined_at: entry.joined_at,
        appointment_id: entry.appointment_id,
      },
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        room_number: doctor.room_number || "Room 204",
      },
      clinic: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
      },
    };
  }
}

export const queueService = new QueueService();
