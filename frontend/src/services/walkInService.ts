import { apiRequest } from './api';
import { realtimeService } from './realtimeService';

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
    const res = await apiRequest('/walk-ins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    realtimeService.broadcastChange('queue_entries', 'INSERT', res.data || payload);
    return res;
  },

  /**
   * Doctor Action: Call patient (waiting -> called)
   */
  async callPatient(queueEntryId: string) {
    const res = await apiRequest(`/queue/${queueEntryId}/call`, {
      method: 'POST',
    });
    realtimeService.broadcastChange('queue_entries', 'UPDATE', { id: queueEntryId, status: 'called' });
    return res;
  },

  /**
   * Doctor Action: Begin consultation (called/waiting -> consulting)
   */
  async startConsultation(queueEntryId: string) {
    const res = await apiRequest(`/queue/${queueEntryId}/start`, {
      method: 'POST',
    });
    realtimeService.broadcastChange('queue_entries', 'UPDATE', { id: queueEntryId, status: 'consulting' });
    return res;
  },

  /**
   * Doctor Action: Complete consultation (consulting -> completed)
   */
  async completeConsultation(queueEntryId: string) {
    const res = await apiRequest(`/queue/${queueEntryId}/complete`, {
      method: 'POST',
    });
    realtimeService.broadcastChange('queue_entries', 'UPDATE', { id: queueEntryId, status: 'completed' });
    return res;
  },

  async updateStatus(id: string, status: string) {
    const res = await apiRequest(`/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    realtimeService.broadcastChange('queue_entries', 'UPDATE', { id, status });
    return res;
  },

  async deleteWalkIn(id: string) {
    const res = await apiRequest(`/walkins/${id}`, {
      method: 'DELETE',
    });
    realtimeService.broadcastChange('queue_entries', 'DELETE', { id });
    return res;
  },
};
