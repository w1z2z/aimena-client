"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

import type { RegistrationPromptReason } from "../registration-prompt";
import { registrationPromptCopy } from "../registration-prompt";

type RegistrationPromptModalProps = {
  open: boolean;
  reason: RegistrationPromptReason;
  onClose: () => void;
};

function RegistrationPromptIcon({ className }: { className?: string }) {
  return (
    <svg
      width="110"
      height="81"
      viewBox="0 0 110 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M62.9552 70.0539C69.8988 84.2672 90.1552 84.2672 97.0988 70.0539L101.176 61.7091L106.364 54.007C115.202 40.887 105.073 23.3443 89.2921 24.4377L80.0275 25.0793L78.9914 25.008C83.0937 12.9264 73.9427 -0.460854 60.2902 0.011879L39.9914 0.715004L19.6916 0.011879C4.48391 -0.514648 -5.14198 16.1577 2.91812 29.0646L13.6769 46.2922L23.2169 64.2228C30.3646 77.6566 49.6171 77.6566 56.7648 64.2228L58.4445 61.0656L58.8791 61.7091L62.9552 70.0539Z"
        fill="url(#registration_prompt_icon_gradient)"
      />
      <defs>
        <linearGradient
          id="registration_prompt_icon_gradient"
          x1="59.1115"
          y1="79.0917"
          x2="165.266"
          y2="-12.4472"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
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
          <RegistrationPromptIcon className="registration-prompt-modal__logo" />

          <h2 id="registration-prompt-title" className="registration-prompt-modal__title">
            Для продолжения
            <br />
            необходимо
            <br />
            авторизоваться
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
