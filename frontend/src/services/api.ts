import { supabase } from '../config/supabase';

/**
 * Central API configuration and request client with automatic Supabase JWT Bearer Auth
 */
export const API_BASE = 'http://localhost:5000/api';

export async function apiRequest<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // 1. Retrieve current active Supabase session token
  let token: string | undefined;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    token = sessionData.session?.access_token;
  } catch (e) {
    console.warn('Could not read Supabase session token:', e);
  }

  // Fallback demo token for demo account session if active
  if (!token) {
    const savedUser = localStorage.getItem('mediqueue_demo_user');
    if (savedUser) {
      token = 'demo-token-123';
    }
  }

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}
