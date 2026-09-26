import { QueueItem, HistoryItem, INIT_QUEUE, INIT_HISTORY } from '../types';

export const queueService = {
  initialize() {
    if (!localStorage.getItem('hospital_queue')) {
      localStorage.setItem('hospital_queue', JSON.stringify(INIT_QUEUE));
    }
    if (!localStorage.getItem('patient_history')) {
      localStorage.setItem('patient_history', JSON.stringify(INIT_HISTORY));
    }
    if (!localStorage.getItem('current_avg_consultation')) {
      localStorage.setItem('current_avg_consultation', '15');
    }
    if (!localStorage.getItem('global_doctor_delay')) {
      localStorage.setItem('global_doctor_delay', '0');
    }
  },

  getLocalQueue(): QueueItem[] {
    try {
      return JSON.parse(localStorage.getItem('hospital_queue') || '[]');
    } catch {
      return [];
    }
  },

  setLocalQueue(queue: QueueItem[]) {
    localStorage.setItem('hospital_queue', JSON.stringify(queue));
    window.dispatchEvent(new Event('storage'));
  },

  getLocalHistory(): HistoryItem[] {
    try {
      return JSON.parse(localStorage.getItem('patient_history') || '[]');
    } catch {
      return [];
    }
  },

  addHistory(item: HistoryItem) {
    const hist = this.getLocalHistory();
    const updated = [item, ...hist];
    localStorage.setItem('patient_history', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  getGlobalDelay(): number {
    return parseInt(localStorage.getItem('global_doctor_delay') || '0', 10);
  },

  setGlobalDelay(mins: number) {
    localStorage.setItem('global_doctor_delay', mins.toString());
    window.dispatchEvent(new Event('storage'));
  },

  getAvgConsultation(): number {
    return parseInt(localStorage.getItem('current_avg_consultation') || '15', 10);
  },

  setAvgConsultation(mins: number) {
    localStorage.setItem('current_avg_consultation', mins.toString());
    window.dispatchEvent(new Event('storage'));
  },
};
