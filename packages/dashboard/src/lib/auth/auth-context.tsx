'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { hasPermission, type Action } from './rbac';

interface AuthContextValue {
  currentUser: User;
  setRole: (role: UserRole) => void;
  can: (action: Action) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_USER: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@oakauth.com',
  role: 'admin',
};

const STORAGE_KEY = 'oakauth_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    if (stored && ['admin', 'viewer', 'agent_owner'].includes(stored)) {
      setUser((u) => ({ ...u, role: stored }));
    }
  }, []);

  const setRole = useCallback((role: UserRole) => {
    localStorage.setItem(STORAGE_KEY, role);
    setUser((u) => ({ ...u, role }));
  }, []);

  const can = useCallback(
    (action: Action) => hasPermission(user.role, action),
    [user.role]
  );

  return (
    <AuthContext.Provider value={{ currentUser: user, setRole, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
