"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import type { ReportReason, ReportTargetType } from "@/shared/api/reports";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { ListingActionStarIcon } from "@/shared/ui/icons";

export const LISTING_REPORT_REASONS = [
  { id: "wrong_info", label: "Неверное описание / фото" },
  { id: "prohibited", label: "Запрещённый товар / услуга" },
  { id: "fraud", label: "Похоже на обман" },
  { id: "spam", label: "Спам / реклама" },
  { id: "already_gone", label: "Уже отдали / неактуально" },
  { id: "wrong_category", label: "Неверная категория" },
  { id: "other", label: "Другое" },
] as const satisfies readonly { id: ReportReason; label: string }[];

export const USER_REPORT_REASONS = [
  { id: "abuse", label: "Оскорбления / токсичность" },
  { id: "fraud", label: "Мошенничество" },
  { id: "no_show", label: "Не приходит / срывает договорённости" },
  { id: "fake", label: "Фейковый аккаунт / бот" },
  { id: "spam", label: "Спам / навязчивые сообщения" },
  { id: "impersonation", label: "Выдаёт себя за другого" },
  { id: "other", label: "Другое" },
] as const satisfies readonly { id: ReportReason; label: string }[];

/** @deprecated use LISTING_REPORT_REASONS / USER_REPORT_REASONS */
export const REPORT_REASONS = LISTING_REPORT_REASONS;

export type ReportReasonId = ReportReason;

type ListingReportModalProps = {
  open: boolean;
  targetType: ReportTargetType;
  pending?: boolean;
  error?: string | null;
  onSubmit: (payload: { reason: ReportReason; comment: string }) => void;
  onClose: () => void;
};

export function ListingReportModal({
  open,
  targetType,
  pending = false,
  error = null,
  onSubmit,
  onClose,
}: ListingReportModalProps) {
  const titleId = useId();
  const { isRendered, isVisible } = useOverlayPresence(open);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState("");

  const reasons =
    targetType === "user" ? USER_REPORT_REASONS : LISTING_REPORT_REASONS;

  useEffect(() => {
    if (!open) return;
    setReason(null);
    setComment("");
  }, [open]);

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

  const canSubmit = reason !== null && !pending;

  return createPortal(
    <div
      className={`listing-action-modal${isVisible ? " is-visible" : ""}`}
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
          {targetType === "user"
            ? "Пожаловаться на пользователя"
            : "Пожаловаться на объявление"}
        </h2>

        <div className="listing-report-reasons" role="radiogroup" aria-label="Причина жалобы">
          {reasons.map((item) => {
            const selected = reason === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="listing-report-reasons__item"
                disabled={pending}
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
            disabled={pending}
          />
        </label>

        {error ? <p className="listing-action-modal__error">{error}</p> : null}

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
