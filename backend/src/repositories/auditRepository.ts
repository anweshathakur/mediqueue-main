import { supabase } from "../config/supabase";
import crypto from "crypto";

export interface AuditRecord {
  id: string;
  user_id?: string | null;
  clinic_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export const auditMemoryStore: AuditRecord[] = [];

export class AuditRepository {
  async createLog(data: {
    user_id?: string | null;
    clinic_id?: string | null;
    action: string;
    resource_type: string;
    resource_id?: string | null;
    metadata?: Record<string, any> | null;
    ip_address?: string | null;
  }): Promise<AuditRecord> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const record: AuditRecord = {
      id,
      user_id: data.user_id || null,
      clinic_id: data.clinic_id || null,
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id || null,
      metadata: data.metadata || null,
      ip_address: data.ip_address || null,
      created_at,
    };

    // Store in memory
    auditMemoryStore.unshift(record);
    if (auditMemoryStore.length > 1000) {
      auditMemoryStore.pop();
    }

    // Persist to Supabase if table is ready
    try {
      await supabase.from("audit_logs").insert([
        {
          id,
          user_id: data.user_id || null,
          clinic_id: data.clinic_id || null,
          action: data.action,
          resource_type: data.resource_type,
          resource_id: data.resource_id || null,
          metadata: data.metadata || null,
          ip_address: data.ip_address || null,
          created_at,
        },
      ]);
    } catch (err) {
      // Non-blocking log
    }

    return record;
  }

  async getLogs(filter?: {
    clinic_id?: string;
    action?: string;
    resource_type?: string;
    limit?: number;
  }): Promise<AuditRecord[]> {
    let list = [...auditMemoryStore];

    if (filter?.clinic_id) {
      list = list.filter((l) => l.clinic_id === filter.clinic_id);
    }
    if (filter?.action) {
      list = list.filter((l) => l.action === filter.action);
    }
    if (filter?.resource_type) {
      list = list.filter((l) => l.resource_type === filter.resource_type);
    }

    const limit = filter?.limit || 50;
    return list.slice(0, limit);
  }
}

export const auditRepository = new AuditRepository();
