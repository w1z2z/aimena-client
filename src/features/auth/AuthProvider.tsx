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

import { AUTH_MOCK_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "./constants";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ needsOnboarding: boolean }>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (categories: string[], city: string | null) => void;
  markOnboardingSkipped: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: AuthUser = {
  id: "mock-user",
  name: "Тестовый пользователь",
  email: "test@swaply.local",
  avatarInitial: "T",
  onboardingCompleted: true,
  favoriteCategories: [],
  city: "Москва",
};

function getInitialFromEmail(email: string): string {
  const localPart = email.split("@")[0]?.trim() ?? "";
  return localPart.charAt(0).toUpperCase() || "U";
}

function createUserFromEmail(email: string, onboardingCompleted = false): AuthUser {
  return {
    id: crypto.randomUUID(),
    name: email.split("@")[0] ?? "Пользователь",
    email,
    avatarInitial: getInitialFromEmail(email),
    onboardingCompleted,
    favoriteCategories: [],
    city: null,
  };
}

function isMockAuthEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_MOCK_STORAGE_KEY) === "true";
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  if (isMockAuthEnabled()) {
    return MOCK_USER;
  }

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

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_MOCK_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const syncUserFromStorage = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    syncUserFromStorage();
    setHydrated(true);

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === AUTH_MOCK_STORAGE_KEY ||
        event.key === AUTH_USER_STORAGE_KEY ||
        event.key === null
      ) {
        syncUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncUserFromStorage]);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      if (isMockAuthEnabled()) {
        window.localStorage.removeItem(AUTH_MOCK_STORAGE_KEY);
      }
      setUser(nextUser);
      writeStoredUser(nextUser);
      return;
    }

    clearAuthStorage();
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      const existing = readStoredUser();
      const nextUser =
        existing?.email === email && !isMockAuthEnabled()
          ? existing
          : createUserFromEmail(email, false);

      if (isMockAuthEnabled()) {
        window.localStorage.removeItem(AUTH_MOCK_STORAGE_KEY);
      }

      persistUser(nextUser);

      return { needsOnboarding: !nextUser.onboardingCompleted };
    },
    [persistUser],
  );

  const register = useCallback(async (_email: string, _password: string) => {
    // Registration only triggers email confirmation in the current UI flow.
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  const completeOnboarding = useCallback(
    (categories: string[], city: string | null) => {
      if (!user) return;

      persistUser({
        ...user,
        onboardingCompleted: true,
        favoriteCategories: categories,
        city,
      });
    },
    [persistUser, user],
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
      login,
      register,
      logout,
      completeOnboarding,
      markOnboardingSkipped,
    }),
    [hydrated, user, login, register, logout, completeOnboarding, markOnboardingSkipped],
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
