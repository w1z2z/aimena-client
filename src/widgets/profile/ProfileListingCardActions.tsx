"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/entities/listing";
import {
  deleteListing,
  pauseListing,
  publishListing,
  type ApiListingCard,
} from "@/shared/api/listings";
import { ApiError } from "@/shared/api/http";
import {
  measureAnchoredDropdown,
  useDropdownDismiss,
} from "@/shared/lib/dropdown-anchor";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { MoreDotsIcon } from "@/shared/ui/icons";
import { ListingConfirmModal } from "@/widgets/listing-detail/ListingConfirmModal";

import {
  claimProfileListingMenu,
  releaseProfileListingMenu,
} from "./profile-listing-menu-singleton";

type ConfirmKind = "pause" | "delete";

type ProfileListingCardActionsProps = {
  listingId: string;
  status: ApiListingCard["status"];
};

const PROFILE_LISTINGS_QUERY_KEY = ["profile-listings-me"] as const;
const MOBILE_CARD_MENU_MQL = "(max-width: 1120px)";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [useMobilePortal, setUseMobilePortal] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const { isRendered, isVisible } = useOverlayPresence(open);
  const [modal, setModal] = useState<ConfirmKind | null>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmKind | "publish" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const canRepublish = status === "draft" || status === "archived";
  const canEdit = status !== "completed";

  const closeMenu = useCallback(() => setOpen(false), []);

  useDropdownDismiss(open, closeMenu, containerRef, panelRef);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_CARD_MENU_MQL);
    const sync = () => setUseMobilePortal(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      releaseProfileListingMenu(closeMenu);
      return;
    }

    claimProfileListingMenu(closeMenu);
    return () => releaseProfileListingMenu(closeMenu);
  }, [open, closeMenu]);

  useLayoutEffect(() => {
    if (!open || !isRendered || !useMobilePortal) {
      setPanelPosition(null);
      return;
    }

    const placePanel = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      setPanelPosition(measureAnchoredDropdown(trigger, panel, { align: "right" }));
    };

    placePanel();
    const frameId = window.requestAnimationFrame(placePanel);

    const closeOnScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current?.contains(target)) return;
      closeMenu();
    };

    const timeoutId = window.setTimeout(() => {
      window.addEventListener("scroll", closeOnScroll, true);
      window.visualViewport?.addEventListener("scroll", closeOnScroll);
    }, 80);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.visualViewport?.removeEventListener("scroll", closeOnScroll);
      setPanelPosition(null);
    };
  }, [open, isRendered, useMobilePortal, closeMenu]);

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

  const panelReady = !useMobilePortal || panelPosition !== null;
  const showPanel = isVisible && panelReady;

  const panelNode = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label="Действия с объявлением"
      aria-hidden={!showPanel}
      className={[
        "profile-listing-menu__panel",
        useMobilePortal ? "profile-listing-menu__panel--portaled" : "",
        "overlay-pop overlay-pop--origin-right",
        showPanel ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        useMobilePortal && panelPosition
          ? { top: panelPosition.top, left: panelPosition.left }
          : useMobilePortal
            ? { top: -9999, left: -9999, visibility: "hidden" as const }
            : undefined
      }
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
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
  );

  return (
    <div
      ref={containerRef}
      className={[
        "profile-listing-menu",
        open || isRendered ? "profile-listing-menu--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        ref={triggerRef}
        type="button"
        className="profile-listing-menu__trigger"
        aria-label="Действия с объявлением"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isRendered ? panelId : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setActionError(null);
          setOpen((value) => {
            const next = !value;
            if (next) claimProfileListingMenu(closeMenu);
            return next;
          });
        }}
      >
        <MoreDotsIcon className="text-[#1A1A1A]" />
      </button>

      {isRendered && !useMobilePortal ? (
        <div
          className="profile-listing-menu__anchor"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {panelNode}
        </div>
      ) : null}

      {useMobilePortal && isRendered && portalReady
        ? createPortal(panelNode, document.body)
        : null}

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
