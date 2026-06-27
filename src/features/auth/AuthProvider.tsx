"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updateOnboarding,
} from "@/shared/api/auth";
import { mapBackendUserToAuthUser } from "@/shared/api/mappers";
import { ApiError } from "@/shared/api/http";

import {
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from "./constants";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ needsOnboarding: boolean }>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (categories: string[], cityId: string | null) => Promise<void>;
  markOnboardingSkipped: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (user) {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.localStorage.removeItem("swaply-auth-mock");
}

function readAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
}

function writeAccessToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  const syncUserFromStorage = useCallback(() => {
    setUser(readStoredUser());
    setAccessToken(readAccessToken());
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      syncUserFromStorage();
      setHydrated(true);
    });

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === AUTH_USER_STORAGE_KEY ||
        event.key === AUTH_ACCESS_TOKEN_STORAGE_KEY ||
        event.key === null
      ) {
        syncUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncUserFromStorage]);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      setUser(nextUser);
      writeStoredUser(nextUser);
      return;
    }

    clearAuthStorage();
    setUser(null);
    setAccessToken(null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    const syncWithToken = async (token: string) => {
      const meResponse = await getCurrentUser(token);
      const mappedUser = mapBackendUserToAuthUser(meResponse.user);
      setUser(mappedUser);
      writeStoredUser(mappedUser);
      setAccessToken(token);
      writeAccessToken(token);
      return mappedUser;
    };

    const currentToken = readAccessToken();
    if (currentToken) {
      try {
        await syncWithToken(currentToken);
        setSessionLoading(false);
        return;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          clearAuthStorage();
          setUser(null);
          setAccessToken(null);
          setSessionLoading(false);
          return;
        }
      }
    }

    try {
      const refreshed = await refreshSession();
      await syncWithToken(refreshed.accessToken);
    } catch {
      clearAuthStorage();
      setUser(null);
      setAccessToken(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timerId = window.setTimeout(() => {
      void bootstrapSession();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [bootstrapSession, hydrated]);

  const login = useCallback(async (email: string, password: string) => {
    const authPayload = await loginUser(email, password);
    const meResponse = await getCurrentUser(authPayload.accessToken);
    const nextUser = mapBackendUserToAuthUser(meResponse.user);

    setAccessToken(authPayload.accessToken);
    writeAccessToken(authPayload.accessToken);
    persistUser(nextUser);

    return { needsOnboarding: !nextUser.onboardingCompleted };
  }, [persistUser]);

  const register = useCallback(async (email: string, password: string) => {
    await registerUser(email, password);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(accessToken);
    } catch {
      // Ignore logout API errors: local session cleanup should still happen.
    } finally {
      clearAuthStorage();
      setUser(null);
      setAccessToken(null);
    }
  }, [accessToken]);

  const completeOnboarding = useCallback(
    async (categories: string[], cityId: string | null) => {
      if (!accessToken) {
        throw new Error("Не удалось сохранить онбординг: отсутствует сессия");
      }
      if (!cityId) {
        throw new Error("Выберите город");
      }
      if (categories.length === 0) {
        throw new Error("Выберите минимум одну категорию");
      }

      const updated = await updateOnboarding(accessToken, {
        cityId,
        interestCategoryIds: categories,
      });
      persistUser(mapBackendUserToAuthUser(updated.user));
    },
    [accessToken, persistUser],
  );

  const markOnboardingSkipped = useCallback(() => {
    if (!user) return;

    persistUser({
      ...user,
      onboardingCompleted: true,
    });
  }, [persistUser, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: hydrated ? user : null,
      isAuthenticated: hydrated ? Boolean(user) : false,
      isLoading: !hydrated || sessionLoading,
      login,
      register,
      logout,
      completeOnboarding,
      markOnboardingSkipped,
    }),
    [hydrated, user, sessionLoading, login, register, logout, completeOnboarding, markOnboardingSkipped],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
