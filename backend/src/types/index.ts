export interface Patient {
  id: string;
  name: string;
  phone: string;
  type: 'Online' | 'Walk-in';
  scheduled: string;
  status: 'Waiting' | 'Consulting' | 'Completed' | 'No-Show' | 'Cancelled';
  doctor_name?: string;
  department?: string;
  created_at?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: 'on-time' | 'delayed';
  delay?: string;
  patientsAhead: number;
}
