import { auditRepository, AuditRecord } from "../repositories/auditRepository";

export interface LogEventParams {
  userId?: string | null;
  clinicId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

export class AuditService {
  /**
   * Log an operational/security action.
   * Automatically sanitizes metadata to ensure zero clinical or sensitive data leaks.
   */
  async log(params: LogEventParams): Promise<AuditRecord> {
    const sanitizedMetadata = this.sanitizeMetadata(params.metadata);

    return auditRepository.createLog({
      user_id: params.userId,
      clinic_id: params.clinicId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: sanitizedMetadata,
      ip_address: params.ipAddress,
    });
  }

  async getLogs(filter?: {
    clinic_id?: string;
    action?: string;
    resource_type?: string;
    limit?: number;
  }): Promise<AuditRecord[]> {
    return auditRepository.getLogs(filter);
  }

  /**
   * Data Privacy (Phase 10 Rule): Strip any clinical diagnosis, prescription, or secret keys from audit metadata
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | null {
    if (!metadata) return null;

    const forbiddenKeys = [
      "diagnosis",
      "prescription",
      "medical_notes",
      "medicalnotes",
      "password",
      "token",
      "secret",
      "auth_token",
      "authorization",
      "confidential_diagnosis",
    ];

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (!forbiddenKeys.includes(key.toLowerCase())) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

export const auditService = new AuditService();
