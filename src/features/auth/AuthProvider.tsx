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

import type { AuthUser } from "./types";

const STORAGE_KEY = "swaply-auth-user";

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

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setHydrated(true);
  }, []);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    writeStoredUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const existing = readStoredUser();
    const nextUser =
      existing?.email === email
        ? existing
        : createUserFromEmail(email, false);

    persistUser(nextUser);

    return { needsOnboarding: !nextUser.onboardingCompleted };
  }, [persistUser]);

  const register = useCallback(async (_email: string, _password: string) => {
    // Registration only triggers email confirmation in the current UI flow.
  }, []);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

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
