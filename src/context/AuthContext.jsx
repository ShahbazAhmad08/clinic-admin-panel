'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN = {
  email: 'admin@arogyacare.com',
  password: 'admin123',
  name: 'Clinic Administrator',
  role: 'SUPER_ADMIN',
  clinic: 'ArogyaCare Multi-Specialty OPD',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local session
    const stored = localStorage.getItem('arogya_admin_session');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('arogya_admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    // Validate credentials
    if (
      (trimmedEmail === DEFAULT_ADMIN.email.toLowerCase() || trimmedEmail === 'admin') &&
      password === DEFAULT_ADMIN.password
    ) {
      const sessionUser = {
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        role: DEFAULT_ADMIN.role,
        clinic: DEFAULT_ADMIN.clinic,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('arogya_admin_session', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { success: true };
    }

    return { success: false, error: 'Invalid admin email or password. Default: admin@arogyacare.com / admin123' };
  };

  const logout = () => {
    localStorage.removeItem('arogya_admin_session');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
