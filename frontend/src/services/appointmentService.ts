import { apiRequest } from './api';

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
    return res.data || res;
  },

  /**
   * Check in an appointment on appointment day -> enters live doctor queue
   */
  async checkIn(appointmentId: string, patientId?: string): Promise<any> {
    return apiRequest(`/appointments/${appointmentId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId }),
    });
  },

  /**
   * Get patient's live queue status across doctors
   */
  async getMyQueueStatus(patientIdentifier?: string): Promise<PatientLiveQueueResponse> {
    const query = patientIdentifier ? `?patient_id=${encodeURIComponent(patientIdentifier)}` : '';
    return apiRequest(`/queue/my${query}`);
  },

  /**
   * Get patient's appointments
   */
  async getMyAppointments(patientIdentifier?: string): Promise<Appointment[]> {
    const query = patientIdentifier ? `?patient_id=${encodeURIComponent(patientIdentifier)}` : '';
    return apiRequest(`/appointments/my${query}`);
  },

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(id: string, newTime: string): Promise<Appointment> {
    const res = await apiRequest(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_at: newTime }),
    });
    return res.data || res;
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string): Promise<Appointment> {
    const res = await apiRequest(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
    return res.data || res;
  },
};
