"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { AuthUnionIcon } from "@/shared/ui/icons";

import type { RegistrationPromptReason } from "../registration-prompt";
import { registrationPromptCopy } from "../registration-prompt";

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
  const { isRendered, isVisible } = useOverlayPresence(open);

  useEffect(() => {
    if (!isRendered) return;

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
  }, [isRendered, onClose]);

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`registration-prompt-modal${isVisible ? " is-visible" : ""}`}
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
        <div className="registration-prompt-modal__card-inner">
          <button
            type="button"
            aria-label="Закрыть"
            className="registration-prompt-modal__close"
            onClick={onClose}
          >
            <CloseIcon />
          </button>

          <AuthUnionIcon
            className="registration-prompt-modal__logo"
            aria-hidden="true"
          />

          <h2 id="registration-prompt-title" className="registration-prompt-modal__title">
            Для продолжения необходимо авторизоваться
          </h2>

          <div className="registration-prompt-modal__actions">
            <p id="registration-prompt-subtitle" className="registration-prompt-modal__subtitle">
              {subtitle}
            </p>

            <div className="registration-prompt-modal__buttons">
              <Link href="/login" className="registration-prompt-modal__button" onClick={onClose}>
                Авторизоваться
              </Link>
              <button
                type="button"
                className="registration-prompt-modal__button registration-prompt-modal__button--cancel"
                onClick={onClose}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
