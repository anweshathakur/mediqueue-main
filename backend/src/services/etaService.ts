export interface EtaCalculationParams {
  doctorId: string;
  patientPriority: 'critical' | 'priority' | 'normal';
  peopleAhead: number;
  activeConsultationStartedAt?: string | null;
  avgConsultationMinutes?: number;
  globalDelayMinutes?: number;
  isAppointment?: boolean;
}

export interface EtaResult {
  estimatedWaitMinutes: number;
  estimatedWaitFormatted: string;
  peopleAhead: number;
  averageConsultationMinutes: number;
  currentConsultationRemainingMinutes: number;
  globalDelayMinutes: number;
  source: 'ml_service' | 'deterministic_fallback';
}

export class EtaService {
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Hybrid ETA Calculation:
   * 1. Primary: Queries FastAPI ML service (POST /predict-eta)
   * 2. Fallback: Uses deterministic formula if ML service is unreachable
   */
  public async calculateEta(params: EtaCalculationParams): Promise<EtaResult> {
    const {
      patientPriority,
      peopleAhead,
      activeConsultationStartedAt,
      avgConsultationMinutes = 12,
      globalDelayMinutes = 0,
      isAppointment = true,
    } = params;

    // 1. Critical Priority is expedited immediately (0 mins)
    if (patientPriority === 'critical') {
      return {
        estimatedWaitMinutes: 0,
        estimatedWaitFormatted: 'Ready now (Emergency Priority)',
        peopleAhead: 0,
        averageConsultationMinutes: avgConsultationMinutes,
        currentConsultationRemainingMinutes: 0,
        globalDelayMinutes,
        source: 'ml_service',
      };
    }

    // 2. Compute remaining minutes on active consultation
    let currentConsultationRemaining = 0;
    if (activeConsultationStartedAt) {
      const startMs = new Date(activeConsultationStartedAt).getTime();
      const elapsedMins = Math.max(0, Math.floor((Date.now() - startMs) / 60000));
      currentConsultationRemaining = Math.max(1, avgConsultationMinutes - elapsedMins);
    }

    // 3. Convert priority to numeric schema (0=normal, 1=priority, 2=critical)
    const priorityNumeric = patientPriority === 'critical' ? 2 : patientPriority === 'priority' ? 1 : 0;
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun

    // 4. Attempt ML inference
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s max latency budget

      const response = await fetch(`${this.mlServiceUrl}/predict-eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patients_ahead: peopleAhead,
          priority: priorityNumeric,
          hour,
          day_of_week: dayOfWeek,
          doctor_avg_duration: avgConsultationMinutes,
          is_appointment: isAppointment ? 1 : 0,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const mlWait = Math.round(Number(data.predicted_eta_minutes) + currentConsultationRemaining + globalDelayMinutes);
        const wait = Math.max(0, mlWait);
        const formatted = wait === 0 ? 'Ready now' : wait <= 5 ? '< 5 mins' : `~${wait} min`;

        return {
          estimatedWaitMinutes: wait,
          estimatedWaitFormatted: formatted,
          peopleAhead,
          averageConsultationMinutes: avgConsultationMinutes,
          currentConsultationRemainingMinutes: currentConsultationRemaining,
          globalDelayMinutes,
          source: 'ml_service',
        };
      }
    } catch (err) {
      // Graceful fallback on network/timeout error
    }

    // 5. Fallback Deterministic Calculation
    return this.calculateDeterministic({
      patientPriority,
      peopleAhead,
      currentConsultationRemaining,
      avgConsultationMinutes,
      globalDelayMinutes,
    });
  }

  private calculateDeterministic(params: {
    patientPriority: 'critical' | 'priority' | 'normal';
    peopleAhead: number;
    currentConsultationRemaining: number;
    avgConsultationMinutes: number;
    globalDelayMinutes: number;
  }): EtaResult {
    const {
      peopleAhead,
      currentConsultationRemaining,
      avgConsultationMinutes,
      globalDelayMinutes,
    } = params;

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
        source: 'deterministic_fallback',
      };
    }

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
      source: 'deterministic_fallback',
    };
  }
}

export const etaService = new EtaService();
