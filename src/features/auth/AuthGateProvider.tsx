"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { RegistrationPromptModal } from "./ui/RegistrationPromptModal";

import { useAuth } from "./AuthProvider";
import type { RegistrationPromptReason } from "./registration-prompt";

type AuthGateContextValue = {
  openRegistrationPrompt: (reason: RegistrationPromptReason) => void;
  closeRegistrationPrompt: () => void;
  guardAuth: (reason: RegistrationPromptReason, action?: () => void) => boolean;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<RegistrationPromptReason>("create-listing");

  const openRegistrationPrompt = useCallback((nextReason: RegistrationPromptReason) => {
    setReason(nextReason);
    setIsOpen(true);
  }, []);

  const closeRegistrationPrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  const guardAuth = useCallback(
    (nextReason: RegistrationPromptReason, action?: () => void) => {
      if (isAuthenticated) {
        action?.();
        return true;
      }

      openRegistrationPrompt(nextReason);
      return false;
    },
    [isAuthenticated, openRegistrationPrompt],
  );

  const value = useMemo(
    () => ({
      openRegistrationPrompt,
      closeRegistrationPrompt,
      guardAuth,
    }),
    [closeRegistrationPrompt, guardAuth, openRegistrationPrompt],
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <RegistrationPromptModal open={isOpen} reason={reason} onClose={closeRegistrationPrompt} />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }
  return context;
}
