export interface EtaCalculationParams {
  doctorId: string;
  patientPriority: 'critical' | 'priority' | 'normal';
  peopleAhead: number;
  activeConsultationStartedAt?: string | null;
  avgConsultationMinutes?: number;
  globalDelayMinutes?: number;
}

export interface EtaResult {
  estimatedWaitMinutes: number;
  estimatedWaitFormatted: string;
  peopleAhead: number;
  averageConsultationMinutes: number;
  currentConsultationRemainingMinutes: number;
  globalDelayMinutes: number;
}

export class EtaService {
  /**
   * Deterministic ETA Calculation
   * ETA = (waitingPatientsAhead * avgConsultationMinutes) + activeConsultationRemaining + globalDelay
   */
  public calculateEta(params: EtaCalculationParams): EtaResult {
    const {
      patientPriority,
      peopleAhead,
      activeConsultationStartedAt,
      avgConsultationMinutes = 12,
      globalDelayMinutes = 0,
    } = params;

    // 1. Critical Priority is expedited immediately
    if (patientPriority === 'critical') {
      return {
        estimatedWaitMinutes: 0,
        estimatedWaitFormatted: 'Ready now (Emergency Priority)',
        peopleAhead: 0,
        averageConsultationMinutes: avgConsultationMinutes,
        currentConsultationRemainingMinutes: 0,
        globalDelayMinutes,
      };
    }

    // 2. Compute remaining minutes on active consultation
    let currentConsultationRemaining = 0;
    if (activeConsultationStartedAt) {
      const startMs = new Date(activeConsultationStartedAt).getTime();
      const elapsedMins = Math.max(0, Math.floor((Date.now() - startMs) / 60000));
      currentConsultationRemaining = Math.max(1, avgConsultationMinutes - elapsedMins);
    }

    // 3. Compute deterministic wait time
    if (peopleAhead === 0) {
      const totalWait = currentConsultationRemaining + globalDelayMinutes;
      const formatted = totalWait === 0 ? 'Ready now' : totalWait <= 5 ? '< 5 mins' : `~${totalWait} min`;
      return {
        estimatedWaitMinutes: totalWait,
        estimatedWaitFormatted: formatted,
        peopleAhead: 0,
        averageConsultationMinutes: avgConsultationMinutes,
        currentConsultationRemainingMinutes: currentConsultationRemaining,
        globalDelayMinutes,
      };
    }

    // Waiting queue calculation
    const totalWait = Math.max(
      1,
      peopleAhead * avgConsultationMinutes + currentConsultationRemaining + globalDelayMinutes
    );

    const formatted = totalWait <= 5 ? '< 5 mins' : `~${totalWait} min`;

    return {
      estimatedWaitMinutes: totalWait,
      estimatedWaitFormatted: formatted,
      peopleAhead,
      averageConsultationMinutes: avgConsultationMinutes,
      currentConsultationRemainingMinutes: currentConsultationRemaining,
      globalDelayMinutes,
    };
  }
}

export const etaService = new EtaService();
