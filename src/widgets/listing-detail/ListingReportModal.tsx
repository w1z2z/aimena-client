"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { ListingActionStarIcon } from "@/shared/ui/icons";

const TRANSITION_MS = 320;

export const REPORT_REASONS = [
  { id: "fraud", label: "Мошенничество или обман" },
  { id: "abuse", label: "Оскорбительное поведение" },
  { id: "fake", label: "Фейковый аккаунт / бот" },
  { id: "prohibited", label: "Запрещенный товар" },
  { id: "spam", label: "Спам" },
  { id: "other", label: "Другое" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];

type ListingReportModalProps = {
  open: boolean;
  pending?: boolean;
  onSubmit: (payload: { reason: ReportReasonId; comment: string }) => void;
  onClose: () => void;
};

export function ListingReportModal({
  open,
  pending = false,
  onSubmit,
  onClose,
}: ListingReportModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<ReportReasonId | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setMounted(true);
      setReason(null);
      setComment("");
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

  const canSubmit = reason !== null && !pending;

  return createPortal(
    <div
      className={`listing-action-modal${visible ? " is-visible" : ""}`}
      role="presentation"
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        className="listing-action-modal__card listing-action-modal__card--report"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <ListingActionStarIcon className="listing-action-modal__star" />
        <h2 id={titleId} className="listing-action-modal__title">
          Выберите причину жалобы
        </h2>

        <div className="listing-report-reasons" role="radiogroup" aria-label="Причина жалобы">
          {REPORT_REASONS.map((item) => {
            const selected = reason === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="listing-report-reasons__item"
                onClick={() => setReason(item.id)}
              >
                <span
                  className={[
                    "listing-report-reasons__check",
                    selected ? "listing-report-reasons__check--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                <span className="listing-report-reasons__label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <label className="listing-report-comment">
          <span className="listing-report-comment__label">Комментарий:</span>
          <textarea
            className="listing-report-comment__field"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Опишите ситуацию, чтобы мы лучше смогли в ней разобраться"
          />
        </label>

        <div className="listing-action-modal__actions">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--primary"
            disabled={!canSubmit}
            onClick={() => {
              if (!reason) return;
              onSubmit({ reason, comment: comment.trim() });
            }}
          >
            {pending ? "Отправляем…" : "Отправить жалобу"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
