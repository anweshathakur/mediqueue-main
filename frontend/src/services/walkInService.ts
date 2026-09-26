import { apiRequest } from './api';

export interface WalkInPayload {
  name: string;
  phone: string;
  age: number;
  doctor_name?: string;
  department?: string;
  priority?: boolean;
}

export const walkInClient = {
  async getQueue() {
    return apiRequest('/queue');
  },

  async createWalkIn(payload: WalkInPayload) {
    return apiRequest('/walkins', {
      method: 'POST',
      body: JSON.stringify(payload),
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
