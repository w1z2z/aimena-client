"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/entities/listing";
import {
  deleteListing,
  pauseListing,
  publishListing,
  type ApiListingCard,
} from "@/shared/api/listings";
import { ApiError } from "@/shared/api/http";
import { ListingConfirmModal } from "@/widgets/listing-detail/ListingConfirmModal";

type ConfirmKind = "pause" | "delete";

type ProfileListingCardActionsProps = {
  listingId: string;
  status: ApiListingCard["status"];
};

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
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ConfirmKind | null>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmKind | "publish" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const closeModal = () => {
    if (pendingAction) return;
    setModal(null);
    setActionError(null);
  };

  const handlePause = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction("pause");
    try {
      await pauseListing(listingId);
      await invalidateListingCaches(queryClient, listingId);
      setModal(null);
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
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Не удалось удалить объявление");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="profile-listing-card-actions">
      {status === "active" ? (
        <button
          type="button"
          className="profile-listing-card-actions__btn"
          disabled={pendingAction !== null}
          onClick={() => {
            setActionError(null);
            setModal("pause");
          }}
        >
          Снять с публикации
        </button>
      ) : (
        <button
          type="button"
          className="profile-listing-card-actions__btn"
          disabled={pendingAction !== null}
          onClick={() => {
            void handlePublish();
          }}
        >
          {status === "draft" ? "Опубликовать" : "Опубликовать снова"}
        </button>
      )}

      <Link
        href={`/listings/${listingId}/edit`}
        className="profile-listing-card-actions__btn profile-listing-card-actions__btn--link"
      >
        Редактировать
      </Link>

      <button
        type="button"
        className="profile-listing-card-actions__btn profile-listing-card-actions__btn--danger"
        disabled={pendingAction !== null}
        onClick={() => {
          setActionError(null);
          setModal("delete");
        }}
      >
        Удалить
      </button>

      {actionError && !modal ? (
        <p className="profile-listing-card-actions__error">{actionError}</p>
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
