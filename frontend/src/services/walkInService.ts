import { apiRequest } from './api';

export interface WalkInPayload {
  name: string;
  phone: string;
  age?: number;
  doctor_id?: string;
  doctor_name?: string;
  department?: string;
  priority?: boolean | string;
}

export interface BackendQueueItem {
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

export const walkInClient = {
  /**
   * Fetch doctor queue with dynamic positioning & priority sorting
   */
  async getDoctorQueue(doctorId: string | number = "1"): Promise<BackendQueueItem[]> {
    return apiRequest(`/queue/${doctorId}`);
  },

  /**
   * Fetch master queue across all doctors
   */
  async getQueue(): Promise<any> {
    return apiRequest('/queue');
  },

  /**
   * Register a new walk-in patient into the queue
   */
  async createWalkIn(payload: WalkInPayload) {
    return apiRequest('/walk-ins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Doctor Action: Call patient (waiting -> called)
   */
  async callPatient(queueEntryId: string) {
    return apiRequest(`/queue/${queueEntryId}/call`, {
      method: 'POST',
    });
  },

  /**
   * Doctor Action: Begin consultation (called/waiting -> consulting)
   */
  async startConsultation(queueEntryId: string) {
    return apiRequest(`/queue/${queueEntryId}/start`, {
      method: 'POST',
    });
  },

  /**
   * Doctor Action: Complete consultation (consulting -> completed)
   */
  async completeConsultation(queueEntryId: string) {
    return apiRequest(`/queue/${queueEntryId}/complete`, {
      method: 'POST',
    });
  },

  async updateStatus(id: string, status: string) {
    return apiRequest(`/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteWalkIn(id: string) {
    return apiRequest(`/walkins/${id}`, {
      method: 'DELETE',
    });
  },
};

