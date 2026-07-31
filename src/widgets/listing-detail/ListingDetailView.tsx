"use client";

import { useParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  buildWantsPreview,
  EXTRA_PAY_LABELS,
  mapApiConditionToLabel,
  useListing,
} from "@/entities/listing";
import { useAuth } from "@/features/auth/AuthProvider";
import { useAuthGate } from "@/features/auth";
import { ApiError } from "@/shared/api/http";
import { Header } from "@/widgets/header/Header";

import { ListingActionsMenu } from "./ListingActionsMenu";
import { ListingGallery } from "./ListingGallery";
import { ListingOwnerCard } from "./ListingOwnerCard";
import { ListingSimilarSection, formatEstimatedPrice } from "./ListingSimilarSection";

const DESCRIPTION_COLLAPSE_CHARS = 420;
/** ~5 lines at 14px / 1.7 */
const DESCRIPTION_COLLAPSED_HEIGHT = 119;

export function ListingDetailView() {
  const params = useParams<{ listingId: string }>();
  const listingId = typeof params.listingId === "string" ? params.listingId : "";
  const { user } = useAuth();
  const { guardAuth } = useAuthGate();
  const { data, isLoading, isError, error } = useListing(listingId);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionTextRef = useRef<HTMLParagraphElement>(null);
  const [descriptionFullHeight, setDescriptionFullHeight] = useState(0);

  const listing = data?.listing;
  const isOwner = Boolean(user?.id && listing?.owner?.id && user.id === listing.owner.id);

  const itemImages = useMemo(() => {
    if (!listing) return [];
    return listing.images
      .filter((image) => image.kind === "item")
      .slice()
      .sort((a, b) => {
        if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      })
      .map((image) => ({ id: image.id, url: image.url }));
  }, [listing]);

  const metaTags = useMemo(() => {
    if (!listing) return [];
    const tags = [listing.city.name, listing.category.name];
    if (listing.hasDocuments) tags.push("С документами");
    if (listing.isFree) tags.push("Даром");
    return tags;
  }, [listing]);

  const wantsTags = useMemo(() => {
    if (!listing) return [];
    return buildWantsPreview(listing);
  }, [listing]);

  const description = listing?.description?.trim() ?? "";
  const canCollapseDescription = description.length > DESCRIPTION_COLLAPSE_CHARS;

  useLayoutEffect(() => {
    setDescriptionExpanded(false);
    const node = descriptionTextRef.current;
    if (!node) {
      setDescriptionFullHeight(0);
      return;
    }
    setDescriptionFullHeight(node.scrollHeight);
  }, [description, listing?.id]);

  const descriptionClipHeight =
    !canCollapseDescription || descriptionExpanded
      ? descriptionFullHeight
      : Math.min(DESCRIPTION_COLLAPSED_HEIGHT, descriptionFullHeight || DESCRIPTION_COLLAPSED_HEIGHT);

  const handleProposeExchange = () => {
    guardAuth("propose-exchange");
  };

  const notFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="listing-detail-page min-h-screen bg-[#F8F8F5]">
      <Header />

      <main className="listing-detail-page__main mx-auto w-full max-w-[1440px] px-6 pb-16 pt-[102px]">
        {isLoading ? (
          <p className="listing-detail-page__status">Загрузка объявления…</p>
        ) : null}

        {notFound ? (
          <p className="listing-detail-page__status">Объявление не найдено.</p>
        ) : null}

        {isError && !notFound ? (
          <p className="listing-detail-page__status">
            Не удалось загрузить объявление. Попробуйте обновить страницу.
          </p>
        ) : null}

        {listing ? (
          <div className="listing-detail-layout">
            <div className="listing-detail-layout__left">
              <ListingGallery
                listingId={listing.id}
                title={listing.title}
                images={itemImages}
                isFavorite={listing.isFavorite}
                hideFavorite={isOwner}
                imageMuted={listing.status === "archived"}
              />
              {listing.owner ? <ListingOwnerCard owner={listing.owner} /> : null}
            </div>

            <div className="listing-detail-layout__right">
              <div className="listing-detail-heading">
                <div className="listing-detail-heading__top">
                  <h1 className="listing-detail-heading__title">{listing.title}</h1>
                  <ListingActionsMenu
                    listingId={listing.id}
                    isOwner={isOwner}
                    status={listing.status}
                  />
                </div>
                <div className="listing-detail-heading__tags">
                  {metaTags.map((tag) => (
                    <span key={tag} className="listing-detail-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <section className="listing-detail-wants" aria-label="Желаемый обмен">
                <h2 className="listing-detail-wants__title">Желаемый обмен</h2>
                <div className="listing-detail-wants__tags">
                  {wantsTags.length > 0 ? (
                    wantsTags.map((tag) => (
                      <span key={tag} className="listing-detail-wants__tag">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="listing-detail-wants__tag">Любые варианты</span>
                  )}
                </div>
              </section>

              <div className="listing-detail-stats">
                <article className="listing-detail-stat listing-detail-stat--price">
                  <p className="listing-detail-stat__label">Примерная стоимость</p>
                  <span className="listing-detail-stat__value">
                    {formatEstimatedPrice(listing.estimatedPrice)}
                  </span>
                </article>
                <article className="listing-detail-stat listing-detail-stat--condition">
                  <p className="listing-detail-stat__label">Состояние</p>
                  <span className="listing-detail-stat__value">
                    {mapApiConditionToLabel(listing.condition)}
                  </span>
                </article>
                <article className="listing-detail-stat listing-detail-stat--extra">
                  <p className="listing-detail-stat__label">Доплата</p>
                  <span className="listing-detail-stat__value">
                    {EXTRA_PAY_LABELS[listing.extraPay]}
                  </span>
                </article>
              </div>

              <section className="listing-detail-description" aria-label="Описание">
                <h2 className="listing-detail-description__title">Описание</h2>
                <div className="listing-detail-description__card">
                  <div
                    className={[
                      "listing-detail-description__clip",
                      canCollapseDescription && !descriptionExpanded
                        ? "listing-detail-description__clip--collapsed"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ maxHeight: descriptionClipHeight || undefined }}
                  >
                    <p
                      ref={descriptionTextRef}
                      className="listing-detail-description__text whitespace-pre-wrap"
                    >
                      {description || "Описание не указано."}
                    </p>
                  </div>
                  {canCollapseDescription ? (
                    <button
                      type="button"
                      className="listing-detail-description__more"
                      onClick={() => setDescriptionExpanded((value) => !value)}
                      aria-expanded={descriptionExpanded}
                    >
                      <span>{descriptionExpanded ? "Свернуть" : "Дальше"}</span>
                      <svg
                        className={[
                          "listing-detail-description__chevron",
                          descriptionExpanded
                            ? "listing-detail-description__chevron--up"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        width="12"
                        height="6"
                        viewBox="0 0 12 6"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M1 1L6 5L11 1"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </section>

              {!isOwner ? (
                <button
                  type="button"
                  className="listing-detail-cta"
                  onClick={handleProposeExchange}
                >
                  Предложить обмен
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {listing ? <ListingSimilarSection listingId={listing.id} /> : null}
      </main>
    </div>
  );
}
