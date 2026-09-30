import { apiRequest } from './api';
import { realtimeService } from './realtimeService';

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic_id: string;
  room_number?: string;
  status: 'available' | 'on_break' | 'off_duty' | 'delayed';
  current_delay?: number;
  patients_ahead?: number;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: 'booked' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  reason?: string;
  created_at: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    room_number?: string;
  };
  clinic?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  patient?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface BookAppointmentPayload {
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  reason?: string;
  patient_name?: string;
  patient_phone?: string;
}

export interface PatientLiveQueueResponse {
  hasActiveQueue: boolean;
  queueEntry?: {
    id: string;
    position: number;
    peopleAhead: number;
    currentlySeeing: string;
    estimatedWait: string;
    estimatedWaitMins: number;
    status: 'waiting' | 'called' | 'consulting' | 'completed' | 'no_show' | 'cancelled';
    priority: 'normal' | 'priority' | 'critical';
    joined_at: string;
    appointment_id?: string | null;
  };
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    room_number?: string;
  };
  clinic?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  message?: string;
}

export const appointmentClient = {
  /**
   * Fetch all clinics
   */
  async getClinics(): Promise<Clinic[]> {
    return apiRequest('/clinics');
  },

  /**
   * Fetch doctors (optionally by clinic)
   */
  async getDoctors(clinicId?: string): Promise<Doctor[]> {
    const query = clinicId ? `?clinic_id=${encodeURIComponent(clinicId)}` : '';
    return apiRequest(`/doctors${query}`);
  },

  /**
   * Book new appointment
   */
  async bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
    const res = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    realtimeService.broadcastChange('appointments', 'INSERT', res.data || res);
    return res.data || res;
  },

  /**
   * Check in an appointment on appointment day -> enters live doctor queue
   */
  async checkIn(appointmentId: string, patientId?: string): Promise<any> {
    const res = await apiRequest(`/appointments/${appointmentId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId }),
    });
    realtimeService.broadcastChange('queue_entries', 'INSERT', res.queueEntry || { appointmentId });
    return res;
  },

  /**
   * Fetch patient's active appointments
   */
  async getMyAppointments(patientIdentifier?: string): Promise<Appointment[]> {
    const query = patientIdentifier ? `?patient_id=${encodeURIComponent(patientIdentifier)}` : '';
    return apiRequest(`/appointments/my${query}`);
  },

  /**
   * Fetch patient's live queue status & deterministic ETA
   */
  async getMyQueueStatus(patientIdentifier?: string): Promise<PatientLiveQueueResponse> {
    const query = patientIdentifier ? `?patient_id=${encodeURIComponent(patientIdentifier)}` : '';
    return apiRequest(`/queue/my${query}`);
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string): Promise<any> {
    const res = await apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
    realtimeService.broadcastChange('appointments', 'UPDATE', { id: appointmentId, status: 'cancelled' });
    return res;
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId: string, newScheduledAt: string): Promise<any> {
    const res = await apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at: newScheduledAt }),
    });
    realtimeService.broadcastChange('appointments', 'UPDATE', { id: appointmentId, scheduled_at: newScheduledAt });
    return res;
  },
};
