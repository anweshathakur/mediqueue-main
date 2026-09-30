import { apiRequest } from './api';
import { realtimeService } from './realtimeService';

export interface InAppNotification {
  id: string;
  patient_id: string;
  appointment_id?: string | null;
  queue_entry_id?: string | null;
  channel: 'in_app' | 'sms' | 'push';
  title?: string;
  message: string;
  status: 'unread' | 'read';
  read_at?: string | null;
  created_at: string;
}

export const notificationClient = {
  /**
   * Fetch in-app notifications for the patient
   */
  async getNotifications(patientIdentifier?: string): Promise<InAppNotification[]> {
    const query = patientIdentifier ? `?patient_id=${encodeURIComponent(patientIdentifier)}` : '';
    return apiRequest(`/notifications${query}`);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<any> {
    const res = await apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    realtimeService.broadcastChange('notifications', 'UPDATE', { id, status: 'read' });
    return res;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(patientIdentifier?: string): Promise<any> {
    const res = await apiRequest('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ patient_id: patientIdentifier || 'demo123@gmail.com' }),
    });
    realtimeService.broadcastChange('notifications', 'UPDATE', { allRead: true });
    return res;
  },
};
