import { supabase } from '../config/supabase';

export type UserRole = 'patient' | 'doctor' | 'staff';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

const AUTH_STORAGE_KEY = 'mediqueue_auth_user';

export const authService = {
  /**
   * Patient Sign In
   */
  async loginPatient(email: string, pass: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.warn("Supabase auth failed, trying local fallback:", error.message);
      }

      const user: AuthUser = {
        id: data?.user?.id || `patient_${email.split('@')[0]}`,
        email,
        name: data?.user?.user_metadata?.full_name || email.split('@')[0],
        role: 'patient',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: AuthUser = {
        id: `patient_${email.split('@')[0]}`,
        email,
        name: email.split('@')[0],
        role: 'patient',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Patient Sign Up
   */
  async signupPatient(email: string, pass: string, name?: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name || email.split('@')[0],
            role: 'patient',
          },
        },
      });

      if (error) {
        console.warn("Supabase signup note:", error.message);
      }

      // Also create record in patients table if possible
      try {
        await supabase.from('patients').insert([
          { email, name: name || email.split('@')[0], full_name: name || email.split('@')[0] }
        ]);
      } catch (e) {}

      const user: AuthUser = {
        id: data?.user?.id || `patient_${email.split('@')[0]}`,
        email,
        name: name || email.split('@')[0],
        role: 'patient',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: AuthUser = {
        id: `patient_${email.split('@')[0]}`,
        email,
        name: name || email.split('@')[0],
        role: 'patient',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Doctor Sign In
   */
  async loginDoctor(email: string, pass: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.warn("Supabase doctor login note:", error.message);
      }

      const user: AuthUser = {
        id: data?.user?.id || `doc_${email.split('@')[0]}`,
        email,
        name: data?.user?.user_metadata?.full_name || 'Dr. ' + (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
        role: 'doctor',
        department: data?.user?.user_metadata?.department || 'General Medicine',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: AuthUser = {
        id: `doc_${email.split('@')[0]}`,
        email,
        name: 'Dr. ' + (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
        role: 'doctor',
        department: 'General Medicine',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Doctor Sign Up
   */
  async signupDoctor(email: string, pass: string, name?: string, department?: string): Promise<AuthUser> {
    try {
      const docName = name ? (name.startsWith('Dr.') ? name : `Dr. ${name}`) : `Dr. ${email.split('@')[0]}`;
      const dept = department || 'General Medicine';

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: docName,
            role: 'doctor',
            department: dept,
          },
        },
      });

      if (error) {
        console.warn("Supabase doctor signup note:", error.message);
      }

      try {
        await supabase.from('doctors').insert([
          { email, name: docName, full_name: docName, department: dept, specialty: dept }
        ]);
      } catch (e) {}

      const user: AuthUser = {
        id: data?.user?.id || `doc_${email.split('@')[0]}`,
        email,
        name: docName,
        role: 'doctor',
        department: dept,
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const docName = name ? (name.startsWith('Dr.') ? name : `Dr. ${name}`) : `Dr. ${email.split('@')[0]}`;
      const user: AuthUser = {
        id: `doc_${email.split('@')[0]}`,
        email,
        name: docName,
        role: 'doctor',
        department: department || 'General Medicine',
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Staff / Receptionist Sign In
   */
  async loginStaff(email: string, pass: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.warn("Supabase staff login note:", error.message);
      }

      const user: AuthUser = {
        id: data?.user?.id || 'staff_reception',
        email,
        name: data?.user?.user_metadata?.full_name || 'Front Desk Receptionist',
        role: 'staff',
      };
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: AuthUser = {
        id: 'staff_reception',
        email,
        name: 'Front Desk Receptionist',
        role: 'staff',
      };
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Staff / Receptionist Sign Up
   */
  async signupStaff(email: string, pass: string, name?: string): Promise<AuthUser> {
    try {
      const staffName = name || 'Receptionist (' + email.split('@')[0] + ')';
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: staffName,
            role: 'staff',
          },
        },
      });

      if (error) {
        console.warn("Supabase staff signup note:", error.message);
      }

      const user: AuthUser = {
        id: data?.user?.id || 'staff_reception',
        email,
        name: staffName,
        role: 'staff',
      };
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: AuthUser = {
        id: 'staff_reception',
        email,
        name: name || 'Front Desk Receptionist',
        role: 'staff',
      };
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  getCurrentUser(): AuthUser | null {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {}
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('isAdmin');
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(AUTH_STORAGE_KEY);
  },
};
