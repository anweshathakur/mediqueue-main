import { Patient } from '../types';

export class QueueRepository {
  // Database / Supabase access layer methods
  async getAll(): Promise<Patient[]> {
    return [];
  }

  async getById(id: string): Promise<Patient | null> {
    return null;
  }

  async create(patient: Partial<Patient>): Promise<Patient | null> {
    return null;
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    return null;
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }
}

export const queueRepository = new QueueRepository();
