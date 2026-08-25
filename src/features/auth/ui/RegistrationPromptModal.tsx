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
          <AuthUnionIcon className="registration-prompt-modal__logo" aria-hidden="true" />

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
