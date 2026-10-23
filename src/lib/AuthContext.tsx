'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playSoundEffect } from '@/lib/utils';

export interface User {
  id: string;
  name: string;
  role: string; // 'OWNER' | 'CASHIER' | 'BARISTA'
  phone?: string | null;
}

interface AuthContextType {
  activeUser: User | null;
  effectiveRole: string;
  isLocked: boolean;
  isLoaded: boolean;
  previewRole: string | null;
  setPreviewRole: (role: string | null) => void;
  setActiveUser: (user: User | null) => void;
  lockScreen: () => void;
  unlock: (user: User) => void;
  logout: () => void;
  hasRole: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5 minutes idle timeout (in ms)
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local/session storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('activeUser');
      const storedLocked = sessionStorage.getItem('isLocked');

      if (stored) {
        const parsed = JSON.parse(stored);
        setActiveUser(parsed);
        // If user is stored, check if they were locked this session
        setIsLocked(storedLocked === 'true');
      } else {
        // No stored user -> Must lock screen
        setIsLocked(true);
      }
    } catch {
      setIsLocked(true);
    }
    setIsLoaded(true);
  }, []);

  const handleSetActiveUser = useCallback((user: User | null) => {
    setActiveUser(user);
    if (user) {
      localStorage.setItem('activeUser', JSON.stringify(user));
      setIsLocked(false);
      sessionStorage.setItem('isLocked', 'false');
    } else {
      localStorage.removeItem('activeUser');
      setPreviewRole(null);
      setIsLocked(true);
      sessionStorage.setItem('isLocked', 'true');
    }
  }, []);

  const lockScreen = useCallback(() => {
    playSoundEffect('alert');
    setIsLocked(true);
    sessionStorage.setItem('isLocked', 'true');
  }, []);

  const unlock = useCallback((user: User) => {
    handleSetActiveUser(user);
    setIsLocked(false);
    sessionStorage.setItem('isLocked', 'false');
  }, [handleSetActiveUser]);

  const logout = useCallback(() => {
    playSoundEffect('beep');
    handleSetActiveUser(null);
  }, [handleSetActiveUser]);

  // Auto-lock idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (activeUser && !isLocked) {
      idleTimerRef.current = setTimeout(() => {
        lockScreen();
      }, IDLE_TIMEOUT_MS);
    }
  }, [activeUser, isLocked, lockScreen]);

  useEffect(() => {
    if (!activeUser || isLocked) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [activeUser, isLocked, resetIdleTimer]);

  const effectiveRole = previewRole || activeUser?.role || '';

  const hasRole = useCallback((allowedRoles: string[]) => {
    if (!activeUser) return false;
    // Real OWNER can do anything unless in preview mode
    if (activeUser.role === 'OWNER' && !previewRole) return true;
    return allowedRoles.includes(effectiveRole);
  }, [activeUser, effectiveRole, previewRole]);

  return (
    <AuthContext.Provider
      value={{
        activeUser,
        effectiveRole,
        isLocked,
        isLoaded,
        previewRole,
        setPreviewRole,
        setActiveUser: handleSetActiveUser,
        lockScreen,
        unlock,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
