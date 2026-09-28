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

const DEMO_EMAIL = 'demo123@gmail.com';
const DEMO_PASS = 'demo@123';

export const authService = {
  /**
   * Patient Sign In - accepts demo credentials or verifies Supabase credentials
   */
  async loginPatient(email: string, pass: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();

    // Master Demo Account check
    if (cleanEmail === DEMO_EMAIL && pass === DEMO_PASS) {
      const demoUser: AuthUser = {
        id: 'patient_demo123',
        email: DEMO_EMAIL,
        name: 'Demo Patient',
        role: 'patient',
        phone: '+91 9876543210'
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    if (!data || !data.user) {
      throw new Error('User not found. Please check your credentials.');
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.full_name || email.split('@')[0],
      role: 'patient',
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Patient Sign Up
   */
  async signupPatient(email: string, pass: string, name?: string): Promise<AuthUser> {
    const trimmedEmail = email.trim();
    const fullName = name?.trim() || trimmedEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          role: 'patient',
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Signup failed');
    }

    if (!data || !data.user) {
      throw new Error('Unable to create patient account.');
    }

    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    // Attempt to register in patients table if configured
    try {
      await supabase.from('patients').insert([
        { id: data.user.id, email: trimmedEmail, name: fullName, full_name: fullName }
      ]);
    } catch (e) {
      // Table insert is optional if handled via db trigger
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || trimmedEmail,
      name: fullName,
      role: 'patient',
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Doctor Sign In - accepts demo credentials or verifies Supabase credentials
   */
  async loginDoctor(email: string, pass: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();

    // Master Demo Account check
    if (cleanEmail === DEMO_EMAIL && pass === DEMO_PASS) {
      const demoUser: AuthUser = {
        id: 'doc_demo123',
        email: DEMO_EMAIL,
        name: 'Dr. Arjun Mehta',
        role: 'doctor',
        department: 'General Medicine'
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      throw new Error(error.message || 'Invalid doctor credentials');
    }

    if (!data || !data.user) {
      throw new Error('Doctor profile not found.');
    }

    const docName = data.user.user_metadata?.full_name || ('Dr. ' + (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)));
    const dept = data.user.user_metadata?.department || 'General Medicine';

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: docName,
      role: 'doctor',
      department: dept,
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Doctor Sign Up
   */
  async signupDoctor(email: string, pass: string, name?: string, department?: string): Promise<AuthUser> {
    const trimmedEmail = email.trim();
    const rawName = name?.trim() || trimmedEmail.split('@')[0];
    const docName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
    const dept = department || 'General Medicine';

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
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
      throw new Error(error.message || 'Doctor signup failed');
    }

    if (!data || !data.user) {
      throw new Error('Unable to create doctor account.');
    }

    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    try {
      await supabase.from('doctors').insert([
        { id: data.user.id, email: trimmedEmail, name: docName, department: dept, specialty: dept }
      ]);
    } catch (e) {
      // Table insert optional if handled via db trigger
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || trimmedEmail,
      name: docName,
      role: 'doctor',
      department: dept,
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Staff / Receptionist Sign In - accepts demo credentials or verifies Supabase credentials
   */
  async loginStaff(email: string, pass: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();

    // Master Demo Account check
    if (cleanEmail === DEMO_EMAIL && pass === DEMO_PASS) {
      const demoUser: AuthUser = {
        id: 'staff_demo123',
        email: DEMO_EMAIL,
        name: 'Front Desk Receptionist',
        role: 'staff',
      };
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      throw new Error(error.message || 'Invalid receptionist / staff credentials');
    }

    if (!data || !data.user) {
      throw new Error('Staff account not found.');
    }

    const staffName = data.user.user_metadata?.full_name || 'Front Desk Receptionist';

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: staffName,
      role: 'staff',
    };

    sessionStorage.setItem('isAdmin', 'true');
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Staff / Receptionist Sign Up
   */
  async signupStaff(email: string, pass: string, name?: string): Promise<AuthUser> {
    const trimmedEmail = email.trim();
    const staffName = name?.trim() || ('Receptionist (' + trimmedEmail.split('@')[0] + ')');

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: pass,
      options: {
        data: {
          full_name: staffName,
          role: 'staff',
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Staff registration failed');
    }

    if (!data || !data.user) {
      throw new Error('Unable to create staff account.');
    }

    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || trimmedEmail,
      name: staffName,
      role: 'staff',
    };

    sessionStorage.setItem('isAdmin', 'true');
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
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
