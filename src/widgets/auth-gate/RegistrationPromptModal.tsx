"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { RegistrationPromptReason } from "@/features/auth/registration-prompt";
import { registrationPromptCopy } from "@/features/auth/registration-prompt";
import { LogoIcon } from "@/shared/ui/icons";

const TRANSITION_MS = 320;

type RegistrationPromptModalProps = {
  open: boolean;
  reason: RegistrationPromptReason;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M1 1L13 13M13 1L1 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RegistrationPromptModal({ open, reason, onClose }: RegistrationPromptModalProps) {
  const { subtitle } = registrationPromptCopy[reason];
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);

      const frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!mounted || open) return;

    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`registration-prompt-modal${visible ? " is-visible" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="registration-prompt-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-prompt-title"
        aria-describedby="registration-prompt-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Закрыть"
          className="registration-prompt-modal__close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <LogoIcon className="registration-prompt-modal__logo" aria-hidden="true" />

        <h2 id="registration-prompt-title" className="registration-prompt-modal__title">
          Для продолжения необходимо авторизоваться
        </h2>

        <p id="registration-prompt-subtitle" className="registration-prompt-modal__subtitle">
          {subtitle}
        </p>

        <Link href="/login" className="registration-prompt-modal__button" onClick={onClose}>
          Авторизация
        </Link>
      </div>
    </div>,
    document.body,
  );
}
