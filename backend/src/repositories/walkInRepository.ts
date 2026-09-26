import { supabase } from '../config/supabase';

export interface WalkInDTO {
  id?: string;
  name: string;
  phone: string;
  age?: number | string;
  sex?: string;
  doctor_name?: string;
  department?: string;
  scheduled?: string;
  status?: string;
  priority?: boolean;
}

export class WalkInRepository {
  private memoryQueue: any[] = [
    { id: '101', name: 'Ravi Kumar', phone: '+91 9876543210', type: 'Online', scheduled: '2:00 PM', status: 'Waiting', doctor_name: 'Dr. Arjun Mehta' },
    { id: '102', name: 'Sita Devi', phone: '+91 9876543211', type: 'Walk-in', scheduled: '2:15 PM', status: 'Waiting', doctor_name: 'Dr. Priya Sharma' },
    { id: '103', name: 'Ananya S.', phone: '+91 9876543212', type: 'Online', scheduled: '2:30 PM', status: 'Waiting', doctor_name: 'Dr. Rohan Kapoor' },
    { id: '104', name: 'Rahul M.', phone: '+91 9876543213', type: 'Online', scheduled: '2:45 PM', status: 'Waiting', doctor_name: 'Dr. Sneha Iyer' },
    { id: '105', name: 'Vikram Singh', phone: '+91 9876543214', type: 'Walk-in', scheduled: '3:00 PM', status: 'Waiting', doctor_name: 'Dr. Vikram Rao' },
  ];

  async createWalkIn(patientData: WalkInDTO): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('hospital_queue')
        .insert([{
          id: patientData.id,
          name: patientData.name,
          phone: patientData.phone,
          type: 'Walk-in',
          scheduled: patientData.scheduled || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: patientData.status || 'Waiting',
          doctor_name: patientData.doctor_name || 'Unassigned',
        }])
        .select()
        .single();

      if (error) {
        this.memoryQueue.push(patientData);
        return patientData;
      }
      return data;
    } catch (err: any) {
      this.memoryQueue.push(patientData);
      return patientData;
    }
  }

  async getAllQueue(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('hospital_queue')
        .select('*');

      if (error || !data || data.length === 0) {
        return this.memoryQueue;
      }
      return data;
    } catch (err) {
      return this.memoryQueue;
    }
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      await supabase
        .from('hospital_queue')
        .update({ status })
        .eq('id', id);

      const idx = this.memoryQueue.findIndex(q => q.id === id);
      if (idx !== -1) {
        this.memoryQueue[idx].status = status;
      }
      return true;
    } catch (err) {
      const idx = this.memoryQueue.findIndex(q => q.id === id);
      if (idx !== -1) {
        this.memoryQueue[idx].status = status;
      }
      return true;
    }
  }

  async deleteQueueItem(id: string): Promise<boolean> {
    try {
      await supabase
        .from('hospital_queue')
        .delete()
        .eq('id', id);

      this.memoryQueue = this.memoryQueue.filter(q => q.id !== id);
      return true;
    } catch (err) {
      this.memoryQueue = this.memoryQueue.filter(q => q.id !== id);
      return true;
    }
  }
}

export const walkInRepository = new WalkInRepository();
