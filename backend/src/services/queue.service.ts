import { queueRepository } from '../repositories';
import { Patient } from '../types';

export class QueueService {
  async getQueue(): Promise<Patient[]> {
    return queueRepository.getAll();
  }

  async addPatient(data: Partial<Patient>): Promise<Patient | null> {
    return queueRepository.create(data);
  }

  async updateStatus(id: string, status: Patient['status']): Promise<Patient | null> {
    return queueRepository.update(id, { status });
  }
}

export const queueService = new QueueService();
