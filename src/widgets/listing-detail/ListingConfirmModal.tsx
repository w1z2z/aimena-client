"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { ListingActionStarIcon } from "@/shared/ui/icons";

const TRANSITION_MS = 320;

export type ListingConfirmModalProps = {
  open: boolean;
  title: ReactNode;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function ListingConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Да",
  cancelLabel = "Нет",
  pending = false,
  error = null,
  onConfirm,
  onClose,
}: ListingConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
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
      if (event.key === "Escape" && !pending) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, pending]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`listing-action-modal${visible ? " is-visible" : ""}`}
      role="presentation"
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        className="listing-action-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
      >
        <ListingActionStarIcon className="listing-action-modal__star" />
        <h2 id={titleId} className="listing-action-modal__title">
          {title}
        </h2>
        <p id={descriptionId} className="listing-action-modal__description">
          {description}
        </p>
        {error ? <p className="listing-action-modal__error">{error}</p> : null}
        <div className="listing-action-modal__actions">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--primary"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Подождите…" : confirmLabel}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
