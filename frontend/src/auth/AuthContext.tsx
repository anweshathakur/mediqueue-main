import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthUser, UserRole } from './authService';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginPatient: (phone: string, name?: string) => Promise<AuthUser>;
  loginDoctor: (doctorId: string, pin: string) => Promise<AuthUser>;
  loginStaff: (staffId: string, pass: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const current = authService.getCurrentUser();
    if (current) setUser(current);
  }, []);

  const loginPatient = async (phone: string, name?: string) => {
    const u = await authService.loginPatient(phone, name);
    setUser(u);
    return u;
  };

  const loginDoctor = async (doctorId: string, pin: string) => {
    const u = await authService.loginDoctor(doctorId, pin);
    setUser(u);
    return u;
  };

  const loginStaff = async (staffId: string, pass: string) => {
    const u = await authService.loginStaff(staffId, pass);
    setUser(u);
    return u;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loginPatient,
        loginDoctor,
        loginStaff,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
