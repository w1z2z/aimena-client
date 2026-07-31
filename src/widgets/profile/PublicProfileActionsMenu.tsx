"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useAuthGate } from "@/features/auth";
import { createReport } from "@/shared/api/reports";
import { ApiError } from "@/shared/api/http";
import { MenuSquareIcon } from "@/shared/ui/icons";
import {
  ListingReportModal,
  type ReportReasonId,
} from "@/widgets/listing-detail/ListingReportModal";

type PublicProfileActionsMenuProps = {
  userId: string;
};

const PANEL_CLOSE_MS = 220;

export function PublicProfileActionsMenu({ userId }: PublicProfileActionsMenuProps) {
  const { guardAuth } = useAuthGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setIsMounted(false), PANEL_CLOSE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeReportModal = () => {
    if (pending) return;
    setReportOpen(false);
  };

  const handleReport = async (payload: { reason: ReportReasonId; comment: string }) => {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await createReport({
        targetType: "user",
        targetId: userId,
        reason: payload.reason,
        comment: payload.comment || undefined,
      });
      setReportOpen(false);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 409
            ? "Вы уже жаловались на этого пользователя"
            : err.message
          : "Не удалось отправить жалобу";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div ref={containerRef} className="listing-detail-actions">
      <button
        type="button"
        className="listing-detail-actions__trigger"
        aria-label="Действия с профилем"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isMounted ? panelId : undefined}
        onClick={() => {
          setError(null);
          setOpen((value) => !value);
        }}
      >
        <MenuSquareIcon className="text-[#1A1A1A]" />
      </button>

      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Действия с профилем"
          aria-hidden={!isVisible}
          className={[
            "listing-detail-actions__panel",
            isVisible ? "listing-detail-actions__panel--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className="listing-detail-actions__item listing-detail-actions__item--danger"
            disabled={pending}
            onClick={() => {
              guardAuth("report-user", () => {
                setOpen(false);
                setError(null);
                setReportOpen(true);
              });
            }}
          >
            Пожаловаться на пользователя
          </button>
        </div>
      ) : null}

      <ListingReportModal
        open={reportOpen}
        targetType="user"
        pending={pending}
        error={error}
        onSubmit={(payload) => {
          void handleReport(payload);
        }}
        onClose={closeReportModal}
      />
    </div>
  );
}
