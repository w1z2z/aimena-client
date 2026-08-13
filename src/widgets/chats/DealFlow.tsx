"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  abortDeal,
  acceptDealCancel,
  completeDeal,
  confirmDealTerms,
  createDealReview,
  rejectDealCancel,
  requestDealCancel,
  unconfirmDealTerms,
  type DealView,
} from "@/shared/api/deals";
import { DealCancelIcon, ListingActionStarIcon } from "@/shared/ui/icons";

const TRANSITION_MS = 320;

export type DealModalKind =
  | "ready"
  | "complete"
  | "review"
  | "refuse"
  | "mutual"
  | "incoming-cancel"
  | null;

export function dealModalFromQuery(value: string | null): DealModalKind {
  if (value === "cancel_request") return "incoming-cancel";
  if (value === "review") return "review";
  if (value === "complete") return "complete";
  return null;
}

type DealModalShellProps = {
  open: boolean;
  title: string;
  icon: "star" | "cancel";
  pending?: boolean;
  error?: string | null;
  dismissible?: boolean;
  onClose: () => void;
  children: ReactNode;
};

function DealModalShell({
  open,
  title,
  icon,
  pending = false,
  error = null,
  dismissible = true,
  onClose,
  children,
}: DealModalShellProps) {
  const titleId = useId();
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
      if (event.key === "Escape" && !pending && dismissible) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, pending, dismissible]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`listing-action-modal${visible ? " is-visible" : ""}`}
      role="presentation"
      onClick={() => {
        if (!pending && dismissible) onClose();
      }}
    >
      <div
        className="listing-action-modal__card listing-action-modal__card--deal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {icon === "star" ? (
          <ListingActionStarIcon className="listing-action-modal__icon" />
        ) : (
          <DealCancelIcon className="listing-action-modal__icon" />
        )}
        <h2 id={titleId} className="listing-action-modal__title">
          {title}
        </h2>
        {children}
        {error ? <p className="listing-action-modal__error">{error}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

function NumberedSteps({ intro, items }: { intro: string; items: string[] }) {
  return (
    <div className="listing-action-modal__steps">
      <p className="listing-action-modal__description listing-action-modal__description--left">
        {intro}
      </p>
      {items.map((item, index) => (
        <div key={item} className="listing-action-modal__step">
          <span className="listing-action-modal__num">{index + 1}</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

export function dealSideStatus(
  deal: DealView | null,
  side: "mine" | "theirs",
) {
  if (!deal) return "Ждём готовности";
  if (deal.status === "cancelled") return "Обмен отменён";
  if (
    deal.status === "awaiting_reviews" ||
    deal.status === "partially_reviewed" ||
    deal.status === "reviewed"
  ) {
    return "Обмен состоялся";
  }
  if (deal.status === "cancellation_pending") {
    const iRequested = deal.cancellationRequestedByMe;
    const thisSideRequested = side === "mine" ? iRequested : !iRequested;
    return thisSideRequested ? "Запросил отмену" : "Ждём решения";
  }
  if (deal.status === "completion_pending") {
    const done =
      side === "mine" ? deal.completedByMe : deal.completedByOther;
    return done ? "Обмен состоялся" : "Ждём подтверждения";
  }
  if (deal.status === "agreed") return "Готов к обмену";
  const ready =
    side === "mine" ? deal.termsConfirmedByMe : deal.termsConfirmedByOther;
  return ready ? "Готов к обмену" : "Ждём готовности";
}

export function DealFlow({
  deal,
  threadStatus,
  initialModal,
  onDealUpdated,
}: {
  deal: DealView | null;
  threadStatus: "active" | "read_only_cancelled" | "read_only_reviewed";
  initialModal?: DealModalKind;
  onDealUpdated: (deal: DealView) => void;
}) {
  const [modal, setModal] = useState<DealModalKind>(initialModal ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewBody, setReviewBody] = useState("");
  const autoOpenedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!deal) return;
    if (deal.canAcceptCancel) {
      setModal("incoming-cancel");
      return;
    }
    const autoKey = `${deal.id}:${deal.status}:${initialModal ?? ""}`;
    if (autoOpenedFor.current === autoKey) return;
    if (initialModal === "review" && deal.canReview) {
      autoOpenedFor.current = autoKey;
      setModal("review");
      return;
    }
    if (initialModal === "complete" && deal.canComplete) {
      autoOpenedFor.current = autoKey;
      setModal("complete");
      return;
    }
    if (deal.canReview && deal.status === "awaiting_reviews") {
      autoOpenedFor.current = autoKey;
      setModal("review");
    }
  }, [deal, initialModal]);

  if (!deal || threadStatus === "read_only_cancelled") {
    return null;
  }

  const run = async (action: () => Promise<{ deal: DealView }>) => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await action();
      onDealUpdated(response.deal);
      setModal(response.deal.canReview ? "review" : null);
    } catch {
      setError("Не удалось выполнить действие. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  };

  const close = () => {
    if (pending) return;
    setError(null);
    setModal(null);
  };

  const showReady = deal.canConfirmTerms || deal.canUnconfirmTerms;
  const readyPressed = deal.termsConfirmedByMe && deal.canUnconfirmTerms;
  const showComplete = deal.canComplete;
  const showRefuse =
    (deal.canAbort || deal.canRequestCancel) &&
    !(deal.status === "cancellation_pending" && deal.cancellationRequestedByMe);
  const showReviewButton = deal.canReview && modal !== "review";

  return (
    <>
      {showReady || showComplete || showRefuse || showReviewButton ? (
        <div className="chats-actions">
          {showReady ? (
            <button
              type="button"
              className={readyPressed ? "is-pressed" : undefined}
              aria-pressed={readyPressed}
              disabled={pending}
              onClick={() => {
                if (readyPressed) {
                  void run(() => unconfirmDealTerms(deal.id));
                  return;
                }
                setModal("ready");
              }}
            >
              {readyPressed ? "Отменить готовность" : "Готов к обмену"}
            </button>
          ) : null}
          {showComplete ? (
            <button type="button" onClick={() => setModal("complete")}>
              Обмен состоялся
            </button>
          ) : null}
          {showReviewButton ? (
            <button type="button" onClick={() => setModal("review")}>
              Оставить отзыв
            </button>
          ) : null}
          {showRefuse ? (
            <button type="button" onClick={() => setModal("refuse")}>
              Отказаться от обмена
            </button>
          ) : null}
        </div>
      ) : null}

      {error && !modal ? (
        <p className="chats-action-error">{error}</p>
      ) : null}

      <DealModalShell
        open={modal === "ready"}
        title="Вы уверены, что готовы к обмену?"
        icon="star"
        pending={pending}
        error={error}
        onClose={close}
      >
        <NumberedSteps
          intro="Перед встречей:"
          items={[
            "Договоритесь о встрече в людном месте;",
            "Проверьте вещь до передачи: включите, осмотрите, сверьте с фото;",
            "Не передавайте вещь до получения вещи взамен.",
          ]}
        />
        <div className="listing-action-modal__actions listing-action-modal__actions--deal">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--primary"
            disabled={pending}
            onClick={() => void run(() => confirmDealTerms(deal.id))}
          >
            {pending ? "Подождите…" : "Да"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={close}
          >
            Нет
          </button>
        </div>
      </DealModalShell>

      <DealModalShell
        open={modal === "complete"}
        title="Обмен действительно состоялся?"
        icon="star"
        pending={pending}
        error={error}
        onClose={close}
      >
        <NumberedSteps
          intro="Подтверждайте только если:"
          items={[
            "Вы лично получили вещь от другого участника;",
            "Вещь соответствует описанию: состояние, комплектация, работоспособность;",
            "Вы готовы завершить сделку и оставить отзыв.",
          ]}
        />
        <div className="listing-action-modal__actions listing-action-modal__actions--deal">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--primary"
            disabled={pending}
            onClick={() => void run(() => completeDeal(deal.id))}
          >
            {pending ? "Подождите…" : "Да"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={close}
          >
            Нет
          </button>
        </div>
      </DealModalShell>

      <DealModalShell
        open={modal === "review"}
        title="Оставьте отзыв о проведенном обмене"
        icon="star"
        pending={pending}
        error={error}
        onClose={close}
      >
        <div className="listing-action-modal__steps">
          <p className="listing-action-modal__description listing-action-modal__description--left">
            Оставьте отзыв о прошедшем обмене:
          </p>
          <textarea
            className="listing-action-modal__textarea"
            placeholder="Введите текст..."
            value={reviewBody}
            maxLength={2000}
            onChange={(event) => setReviewBody(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="listing-action-modal__btn listing-action-modal__btn--primary listing-action-modal__btn--full"
          disabled={pending || !reviewBody.trim()}
          onClick={() => void run(() => createDealReview(deal.id, reviewBody.trim()))}
        >
          {pending ? "Подождите…" : "Отправить"}
        </button>
      </DealModalShell>

      <DealModalShell
        open={modal === "refuse"}
        title="Отказаться от обмена?"
        icon="cancel"
        pending={pending}
        error={error}
        onClose={close}
      >
        <p className="listing-action-modal__description">
          Вы уверены? Это действие нельзя отменить.
        </p>
        <div className="listing-action-modal__actions listing-action-modal__actions--stacked">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary listing-action-modal__btn--full"
            disabled={pending || !deal.canRequestCancel}
            onClick={() => setModal("mutual")}
          >
            Запросить обоюдный отказ
          </button>
          <div className="listing-action-modal__actions listing-action-modal__actions--deal">
            <button
              type="button"
              className="listing-action-modal__btn listing-action-modal__btn--danger"
              disabled={pending || !deal.canAbort}
              onClick={() => void run(() => abortDeal(deal.id))}
            >
              {pending ? "Подождите…" : "Да"}
            </button>
            <button
              type="button"
              className="listing-action-modal__btn listing-action-modal__btn--secondary"
              disabled={pending}
              onClick={close}
            >
              Остаться
            </button>
          </div>
        </div>
      </DealModalShell>

      <DealModalShell
        open={modal === "mutual"}
        title="Обоюдный отказ от обмена"
        icon="cancel"
        pending={pending}
        error={error}
        onClose={() => setModal("refuse")}
      >
        <p className="listing-action-modal__description">
          Вы запрашиваете обоюдный отказ. Он позволяет отказаться от обмена и не
          потерять очки рейтинга
        </p>
        <div className="listing-action-modal__actions listing-action-modal__actions--deal">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--danger"
            disabled={pending}
            onClick={() => void run(() => requestDealCancel(deal.id))}
          >
            {pending ? "Подождите…" : "Подтвердить"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={() => setModal("refuse")}
          >
            Отмена
          </button>
        </div>
      </DealModalShell>

      <DealModalShell
        open={modal === "incoming-cancel"}
        title="Участник обмена запрашивает обоюдный отказ от обмена"
        icon="cancel"
        pending={pending}
        error={error}
        dismissible={false}
        onClose={close}
      >
        <p className="listing-action-modal__description">
          Ваш собеседник запросил обоюдный отказ. При принятии такого отказа очки
          рейтинга не снимаются.
        </p>
        <div className="listing-action-modal__actions listing-action-modal__actions--deal">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--danger"
            disabled={pending}
            onClick={() => void run(() => acceptDealCancel(deal.id))}
          >
            {pending ? "Подождите…" : "Подтвердить"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={pending}
            onClick={() => void run(() => rejectDealCancel(deal.id))}
          >
            Отмена
          </button>
        </div>
      </DealModalShell>
    </>
  );
}
