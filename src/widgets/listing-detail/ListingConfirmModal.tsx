"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { ListingActionStarIcon } from "@/shared/ui/icons";

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
  const { isRendered, isVisible } = useOverlayPresence(open);

  useEffect(() => {
    if (!isRendered) return;
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
  }, [isRendered, onClose, pending]);

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`listing-action-modal${isVisible ? " is-visible" : ""}`}
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
