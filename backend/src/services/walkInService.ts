import { walkInRepository, WalkInDTO } from '../repositories/walkInRepository';

export class WalkInService {
  async registerWalkIn(data: WalkInDTO) {
    if (!data.name || !data.phone) {
      throw new Error('Patient name and phone number are required');
    }

    const currentQueue = await walkInRepository.getAllQueue();
    const maxToken = currentQueue.length > 0 
      ? Math.max(...currentQueue.map((q: any) => parseInt(q.id) || 100))
      : 100;
    
    const newToken = (maxToken + 1).toString();
    const newWalkIn = {
      ...data,
      id: newToken,
      type: 'Walk-in',
      status: 'Waiting',
      scheduled: data.priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return walkInRepository.createWalkIn(newWalkIn);
  }

  async getQueue() {
    return walkInRepository.getAllQueue();
  }

  async updateQueueStatus(id: string, status: string) {
    return walkInRepository.updateStatus(id, status);
  }

  async removeWalkIn(id: string) {
    return walkInRepository.deleteQueueItem(id);
  }
}

export const walkInService = new WalkInService();
