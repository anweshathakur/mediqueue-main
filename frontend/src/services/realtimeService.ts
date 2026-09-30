import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export type RealtimeStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export type QueueChangeEvent = {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  newRecord?: any;
  oldRecord?: any;
  timestamp: string;
};

type ListenerCallback = (event: QueueChangeEvent) => void;

class RealtimeService {
  private channel: RealtimeChannel | null = null;
  private listeners: Set<ListenerCallback> = new Set();
  private status: RealtimeStatus = 'DISCONNECTED';
  private statusListeners: Set<(status: RealtimeStatus) => void> = new Set();

  /**
   * Initialize and subscribe to Supabase Realtime channel
   */
  public init() {
    if (this.channel) return;

    this.setStatus('CONNECTING');

    this.channel = supabase
      .channel('mediqueue-live-events')
      // 1. Listen for PostgreSQL Changes on queue_entries
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_entries' },
        (payload) => {
          this.notifyListeners({
            table: 'queue_entries',
            eventType: payload.eventType as any,
            newRecord: payload.new,
            oldRecord: payload.old,
            timestamp: new Date().toISOString(),
          });
        }
      )
      // 2. Listen for PostgreSQL Changes on appointments
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          this.notifyListeners({
            table: 'appointments',
            eventType: payload.eventType as any,
            newRecord: payload.new,
            oldRecord: payload.old,
            timestamp: new Date().toISOString(),
          });
        }
      )
      // 3. Listen for direct broadcast events (instant sub-millisecond client sync)
      .on('broadcast', { event: 'queue_change' }, (payload) => {
        this.notifyListeners({
          table: payload.payload?.table || 'queue_entries',
          eventType: payload.payload?.eventType || 'UPDATE',
          newRecord: payload.payload?.record,
          timestamp: new Date().toISOString(),
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setStatus('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.setStatus('DISCONNECTED');
        } else {
          this.setStatus('CONNECTING');
        }
      });
  }

  /**
   * Subscribe to queue/appointment changes
   */
  public subscribe(callback: ListenerCallback): () => void {
    this.init();
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(callback: (status: RealtimeStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Broadcast an event to all active clients
   */
  public async broadcastChange(table: string, eventType: string, record?: any) {
    if (!this.channel) this.init();

    // Trigger local listeners immediately
    this.notifyListeners({
      table,
      eventType: eventType as any,
      newRecord: record,
      timestamp: new Date().toISOString(),
    });

    try {
      if (this.channel) {
        await this.channel.send({
          type: 'broadcast',
          event: 'queue_change',
          payload: { table, eventType, record },
        });
      }
    } catch (err) {
      console.warn('Realtime broadcast warning:', err);
    }
  }

  public getStatus(): RealtimeStatus {
    return this.status;
  }

  private setStatus(newStatus: RealtimeStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((cb) => cb(newStatus));
  }

  private notifyListeners(event: QueueChangeEvent) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }
}

export const realtimeService = new RealtimeService();
