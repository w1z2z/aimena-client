"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/entities/listing";
import {
  deleteListing,
  pauseListing,
  publishListing,
  type ApiListingCard,
} from "@/shared/api/listings";
import { ApiError } from "@/shared/api/http";
import { MoreDotsIcon } from "@/shared/ui/icons";
import { ListingConfirmModal } from "@/widgets/listing-detail/ListingConfirmModal";

type ConfirmKind = "pause" | "delete";

type ProfileListingCardActionsProps = {
  listingId: string;
  status: ApiListingCard["status"];
};

const PANEL_CLOSE_MS = 220;
const PROFILE_LISTINGS_QUERY_KEY = ["profile-listings-me"] as const;

async function invalidateListingCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  listingId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: listingQueryKeys.detail(listingId) }),
    queryClient.invalidateQueries({ queryKey: listingQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: PROFILE_LISTINGS_QUERY_KEY }),
  ]);
}

export function ProfileListingCardActions({
  listingId,
  status,
}: ProfileListingCardActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState<ConfirmKind | null>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmKind | "publish" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const canRepublish = status === "draft" || status === "archived";
  const canEdit = status !== "completed";

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
    setActionError(null);
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
      await invalidateListingCaches(queryClient, listingId);
      setModal(null);
      closeMenu();
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Не удалось снять с публикации",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handlePublish = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction("publish");
    try {
      await publishListing(listingId);
      await invalidateListingCaches(queryClient, listingId);
      closeMenu();
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Не удалось опубликовать объявление",
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
      await invalidateListingCaches(queryClient, listingId);
      setModal(null);
      closeMenu();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Не удалось удалить объявление");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={[
        "profile-listing-menu",
        open || isMounted ? "profile-listing-menu--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="profile-listing-menu__trigger"
        aria-label="Действия с объявлением"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isMounted ? panelId : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setActionError(null);
          setOpen((value) => !value);
        }}
      >
        <MoreDotsIcon className="text-[#1A1A1A]" />
      </button>

      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Действия с объявлением"
          aria-hidden={!isVisible}
          className={[
            "profile-listing-menu__panel",
            isVisible ? "profile-listing-menu__panel--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {status === "active" ? (
            <button
              type="button"
              className="profile-listing-menu__item"
              disabled={pendingAction !== null}
              onClick={() => {
                closeMenu();
                setActionError(null);
                setModal("pause");
              }}
            >
              Снять с публикации
            </button>
          ) : null}

          {canRepublish ? (
            <button
              type="button"
              className="profile-listing-menu__item"
              disabled={pendingAction !== null}
              onClick={() => {
                void handlePublish();
              }}
            >
              {status === "draft" ? "Опубликовать" : "Опубликовать снова"}
            </button>
          ) : null}

          {canEdit ? (
            <button
              type="button"
              className="profile-listing-menu__item"
              disabled={pendingAction !== null}
              onClick={() => {
                closeMenu();
                router.push(`/listings/${listingId}/edit`);
              }}
            >
              Редактировать объявление
            </button>
          ) : null}

          <button
            type="button"
            className="profile-listing-menu__item profile-listing-menu__item--danger"
            disabled={pendingAction !== null}
            onClick={() => {
              closeMenu();
              setActionError(null);
              setModal("delete");
            }}
          >
            Удалить объявление
          </button>

          {actionError ? <p className="profile-listing-menu__error">{actionError}</p> : null}
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
    </div>
  );
}
