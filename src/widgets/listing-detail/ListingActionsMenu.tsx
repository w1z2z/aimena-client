"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/entities/listing";
import { useAuthGate } from "@/features/auth";
import { deleteListing, pauseListing } from "@/shared/api/listings";
import { ApiError } from "@/shared/api/http";
import { MenuSquareIcon } from "@/shared/ui/icons";

import { ListingConfirmModal } from "./ListingConfirmModal";
import { ListingReportModal } from "./ListingReportModal";

type ListingActionsMenuProps = {
  listingId: string;
  isOwner: boolean;
};

type ConfirmKind = "pause" | "delete";
type ModalKind = ConfirmKind | "report" | null;

const PANEL_CLOSE_MS = 220;

export function ListingActionsMenu({ listingId, isOwner }: ListingActionsMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { guardAuth } = useAuthGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmKind | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const closeMenu = () => setOpen(false);
  const closeModal = () => {
    if (pendingAction) return;
    setModal(null);
  };

  const confirmConfig = useMemo(() => {
    if (modal === "pause") {
      return {
        title: (
          <>
            Вы уверены, что хотите <span className="listing-action-modal__accent">снять</span>{" "}
            объявление <span className="listing-action-modal__accent">с публикации</span>?
          </>
        ),
        description: "Объявление можно будет снова опубликовать через профиль",
      };
    }
    if (modal === "delete") {
      return {
        title: (
          <>
            Вы уверены, что хотите <span className="listing-action-modal__accent">удалить</span>{" "}
            объявление?
          </>
        ),
        description:
          "Объявление нельзя будет восстановить и вам придется создавать его заново",
      };
    }
    return null;
  }, [modal]);

  const handlePause = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction("pause");
    try {
      await pauseListing(listingId);
      await queryClient.invalidateQueries({ queryKey: listingQueryKeys.detail(listingId) });
      await queryClient.invalidateQueries({ queryKey: listingQueryKeys.all });
      setModal(null);
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Не удалось снять с публикации",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction("delete");
    try {
      await deleteListing(listingId);
      await queryClient.invalidateQueries({ queryKey: listingQueryKeys.all });
      setModal(null);
      router.push("/profile");
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Не удалось удалить объявление");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div ref={containerRef} className="listing-detail-actions">
      <button
        type="button"
        className="listing-detail-actions__trigger"
        aria-label="Действия с объявлением"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isMounted ? panelId : undefined}
        onClick={() => {
          setActionError(null);
          setOpen((value) => !value);
        }}
      >
        <MenuSquareIcon className="text-[#1A1A1A]" />
      </button>

      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Действия с объявлением"
          aria-hidden={!isVisible}
          className={[
            "listing-detail-actions__panel",
            isVisible ? "listing-detail-actions__panel--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isOwner ? (
            <>
              <button
                type="button"
                className="listing-detail-actions__item"
                onClick={() => {
                  closeMenu();
                  setActionError(null);
                  setModal("pause");
                }}
              >
                Снять с публикации
              </button>
              <button
                type="button"
                className="listing-detail-actions__item"
                onClick={closeMenu}
              >
                Редактировать объявление
              </button>
              <button
                type="button"
                className="listing-detail-actions__item listing-detail-actions__item--danger"
                onClick={() => {
                  closeMenu();
                  setActionError(null);
                  setModal("delete");
                }}
              >
                Удалить объявление
              </button>
            </>
          ) : (
            <button
              type="button"
              className="listing-detail-actions__item listing-detail-actions__item--danger"
              onClick={() => {
                guardAuth("report-listing", () => {
                  closeMenu();
                  setActionError(null);
                  setModal("report");
                });
              }}
            >
              Пожаловаться на объявление
            </button>
          )}

          {actionError ? <p className="listing-detail-actions__error">{actionError}</p> : null}
        </div>
      ) : null}

      <ListingConfirmModal
        open={modal === "pause" || modal === "delete"}
        pending={pendingAction !== null}
        error={actionError}
        title={confirmConfig?.title ?? ""}
        description={confirmConfig?.description ?? ""}
        onConfirm={() => {
          if (modal === "pause") void handlePause();
          if (modal === "delete") void handleDelete();
        }}
        onClose={closeModal}
      />

      <ListingReportModal
        open={modal === "report"}
        onSubmit={() => setModal(null)}
        onClose={closeModal}
      />
    </div>
  );
}
