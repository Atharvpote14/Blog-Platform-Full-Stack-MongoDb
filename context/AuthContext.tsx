"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { authApi } from "@/services/auth";
import { SESSION_EXPIRED_EVENT } from "@/services/api";
import type { LoginPayload, RegisterPayload, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      toast.error("Your session has expired. Please log in again.");
      if (window.location.pathname !== "/login") {
        router.replace("/login");
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [router]);

  const login = useCallback(async (payload: LoginPayload) => {
    const currentUser = await authApi.login(payload);
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const currentUser = await authApi.register(payload);
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
