import { queueRepository, QueueEntryRecord, ConsultationRecord } from "../repositories/queueRepository";

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
      completed_at: entry.completed_at,
    }));
  }

  /**
   * Action: Call next patient (waiting -> called)
   */
  async callNextPatient(queueEntryId: string): Promise<QueueEntryRecord> {
    return queueRepository.updateStatus(queueEntryId, "called", "called_at");
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

    const updatedQueueEntry = await queueRepository.updateStatus(queueEntryId, "consulting");

    const started_at = new Date().toISOString();
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
   */
  async completeConsultation(queueEntryId: string): Promise<{
    queueEntry: QueueEntryRecord;
    consultation: ConsultationRecord | null;
  }> {
    const completed_at = new Date().toISOString();

    const updatedQueueEntry = await queueRepository.updateStatus(
      queueEntryId,
      "completed",
      "completed_at"
    );

    const consultation = await queueRepository.completeConsultation(
      queueEntryId,
      completed_at
    );

    return {
      queueEntry: updatedQueueEntry,
      consultation,
    };
  }
}

export const queueService = new QueueService();
