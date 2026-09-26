export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: 'on-time' | 'delayed';
  delay: string;
  patientsAhead: number;
}

export interface QueueItem {
  id: string;
  rawId?: string | number;
  name: string;
  patient_name?: string;
  phone?: string;
  age?: number;
  type: 'Online' | 'Walk-in';
  scheduled: string;
  scheduled_time?: string;
  status: 'Waiting' | 'Consulting' | 'Completed' | 'No-Show' | 'Cancelled';
  doctor_name?: string;
  department?: string;
  priority?: boolean;
}

export interface HistoryItem {
  id: number | string;
  patient_name: string;
  patient_type: string;
  doctor_name: string;
  completed_at: string;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  symptoms: string;
  doctor_name: string;
  scheduled: string;
  timeSlot: string;
  type: 'Online' | 'Walk-in';
  status: string;
}

export const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "ENT"
];

export const DOCTORS: Doctor[] = [
  { id: 1, name: "Dr. Arjun Mehta", specialty: "General Medicine", status: "on-time", delay: "", patientsAhead: 2 },
  { id: 2, name: "Dr. Priya Sharma", specialty: "Cardiology", status: "delayed", delay: "30m", patientsAhead: 5 },
  { id: 3, name: "Dr. Rohan Kapoor", specialty: "Orthopedics", status: "on-time", delay: "", patientsAhead: 1 },
  { id: 4, name: "Dr. Sneha Iyer", specialty: "Dermatology", status: "on-time", delay: "", patientsAhead: 3 },
  { id: 5, name: "Dr. Vikram Rao", specialty: "Pediatrics", status: "delayed", delay: "15m", patientsAhead: 4 },
  { id: 6, name: "Dr. Ananya Das", specialty: "ENT", status: "on-time", delay: "", patientsAhead: 0 },
];

export const INIT_QUEUE: QueueItem[] = [
  { id: '101', name: 'Ravi Kumar', phone: '9876543210', type: 'Online', scheduled: '2:00 PM', status: 'Waiting', doctor_name: 'Dr. Arjun Mehta', department: 'General Medicine' },
  { id: '102', name: 'Sita Devi', phone: '9876543211', type: 'Walk-in', scheduled: '2:15 PM', status: 'Waiting', doctor_name: 'Dr. Priya Sharma', department: 'Cardiology' },
  { id: '103', name: 'Ananya S.', phone: '9876543212', type: 'Online', scheduled: '2:30 PM', status: 'Waiting', doctor_name: 'Dr. Rohan Kapoor', department: 'Orthopedics' },
  { id: '104', name: 'Rahul M.', phone: '9876543213', type: 'Online', scheduled: '2:45 PM', status: 'Waiting', doctor_name: 'Dr. Sneha Iyer', department: 'Dermatology' },
  { id: '105', name: 'Vikram Singh', phone: '9876543214', type: 'Walk-in', scheduled: '3:00 PM', status: 'Waiting', doctor_name: 'Dr. Vikram Rao', department: 'Pediatrics' },
];

export const INIT_HISTORY: HistoryItem[] = [
  { id: 1, patient_name: 'Aarav Patel', patient_type: 'Online', doctor_name: 'Dr. Arjun Mehta', completed_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 2, patient_name: 'Neha Gupta', patient_type: 'Walk-in', doctor_name: 'Dr. Priya Sharma', completed_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, patient_name: 'Rajesh Khanna', patient_type: 'Online', doctor_name: 'Dr. Rohan Kapoor', completed_at: new Date().toISOString() },
];
