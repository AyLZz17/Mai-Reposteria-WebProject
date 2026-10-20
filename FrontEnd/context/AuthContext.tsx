"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { clearAccessToken, getAccessToken, getCurrentUser, logoutApi, User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  acceptTermsForUser: (userId: string) => void;
  hasAcceptedTerms: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "mai_auth_user";
const STORAGE_KEY_TERMS = "mai_terms_accepted_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
      } catch {
        // La sesión ya fue invalidada; no bloquear la navegación.
      }
    };

    window.addEventListener("mai:auth-expired", handleExpiredSession);
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        void getCurrentUser().then((currentUser) => {
          setUser(currentUser);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        }).catch(() => { if (getAccessToken()) clearAccessToken(); }).finally(() => setIsLoading(false));
      } else {
        queueMicrotask(() => {
          setIsLoading(false);
        });
      }
    } catch {
      // Ignorar errores al leer localStorage
      queueMicrotask(() => setIsLoading(false));
    }
    return () => window.removeEventListener("mai:auth-expired", handleExpiredSession);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
    } catch {
      // Ignorar error al escribir
    }
  };

  const logout = () => {
    setUser(null);
    void logoutApi();
    clearAccessToken();
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // Ignorar error al limpiar
    }
  };

  const hasAcceptedTerms = (userId: string): boolean => {
    try {
      const acceptedList = JSON.parse(
        localStorage.getItem(STORAGE_KEY_TERMS) || "[]"
      );
      return Array.isArray(acceptedList) && acceptedList.includes(userId);
    } catch {
      return false;
    }
  };

  const acceptTermsForUser = (userId: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TERMS);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(userId)) {
        list.push(userId);
        localStorage.setItem(STORAGE_KEY_TERMS, JSON.stringify(list));
      }
      if (user && user.id === userId) {
        const updated = { ...user, acceptedTerms: true };
        setUser(updated);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      }
    } catch {
      // Ignorar error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        acceptTermsForUser,
        hasAcceptedTerms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
