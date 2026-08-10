"use client";

import { useParams, useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  EXTRA_PAY_LABELS,
  mapApiConditionToLabel,
  mapServiceFormatToLabel,
  mapServiceWorkLevelToLabel,
  useListing,
} from "@/entities/listing";
import { useAuth } from "@/features/auth/AuthProvider";
import { useAuthGate } from "@/features/auth";
import { ApiError } from "@/shared/api/http";
import { requestOpenHomeFilters } from "@/shared/lib/home-open-filters";
import { LocationPinIcon } from "@/shared/ui/icons/LocationPinIcon";
import { Header } from "@/widgets/header/Header";

import { ListingActionsMenu } from "./ListingActionsMenu";
import { ListingDetailSkeleton } from "./ListingDetailSkeleton";
import { ListingGallery } from "./ListingGallery";
import { ListingOwnerCard } from "./ListingOwnerCard";
import { ListingSimilarSection, formatEstimatedPrice } from "./ListingSimilarSection";

const DESCRIPTION_COLLAPSE_CHARS = 420;
/** ~7 lines at 14px / 1.7 */
const DESCRIPTION_COLLAPSED_HEIGHT = 166;

function getCategoryIcon(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const match = value?.trim().match(/^\p{Extended_Pictographic}\uFE0F?/u);
    if (match) return match[0];
  }
  return "";
}

function truncateDescriptionAtWord(
  node: HTMLElement,
  fullText: string,
  maxHeight: number,
): string {
  node.textContent = fullText;
  if (node.scrollHeight <= maxHeight) {
    return fullText;
  }

  let low = 0;
  let high = fullText.length;
  let best = "";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    let slice = fullText.slice(0, mid);
    const breakAt = Math.max(
      slice.lastIndexOf(" "),
      slice.lastIndexOf("\n"),
      slice.lastIndexOf("\t"),
    );
    if (breakAt > 0) {
      slice = slice.slice(0, breakAt);
    }

    const candidate = `${slice.trimEnd()}…`;
    node.textContent = candidate;

    if (node.scrollHeight <= maxHeight) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best || "…";
}

export function ListingDetailView() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = typeof params.listingId === "string" ? params.listingId : "";
  const { user } = useAuth();
  const { guardAuth } = useAuthGate();
  const { data, isLoading, isError, error } = useListing(listingId);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionTextRef = useRef<HTMLParagraphElement>(null);
  const [descriptionFullHeight, setDescriptionFullHeight] = useState(0);
  const [collapsedDescription, setCollapsedDescription] = useState<string | null>(null);

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
      .map((image) => ({
        id: image.id,
        url: image.thumbUrl ?? image.url,
        fullUrl: image.fullUrl ?? image.url,
      }));
  }, [listing]);

  const categoryBreadcrumb = useMemo(() => {
    if (!listing) return [];
    const { category } = listing;
    if (category.parent?.name) {
      return [
        {
          id: category.parent.id,
          parentId: null,
          name: category.parent.shortName?.trim() || category.parent.name,
        },
        {
          id: category.id,
          parentId: category.parent.id,
          name: category.shortName?.trim() || category.name,
        },
      ];
    }
    return [
      {
        id: category.id,
        parentId: null,
        name: category.shortName?.trim() || category.name,
      },
    ];
  }, [listing]);

  const wantsCategories = useMemo(() => {
    if (!listing) return [];

    return (listing.wantsCategories ?? [])
      .map((wantsCategory) => {
        const name = wantsCategory.shortName?.trim() || wantsCategory.name?.trim();
        if (!name) return null;
        return {
          id: wantsCategory.id,
          parentId: wantsCategory.parent?.id ?? null,
          name,
          icon: getCategoryIcon(wantsCategory.parent?.name, wantsCategory.name),
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
  }, [listing]);

  const wantsThings = useMemo(() => {
    if (!listing) return [];

    const fromText = listing.wantsText
      .split(/[,\n;]+/)
      .map((part) =>
        part
          .replace(/^хочу(?:\s+получить)?(?:\s+взамен)?\s*[:\-]?\s*/i, "")
          .replace(/^ищу\s*/i, "")
          .trim(),
      )
      .filter(Boolean);

    const fromTags = listing.wantsTags.map((tag) => tag.trim()).filter(Boolean);
    return [...new Map([...fromText, ...fromTags].map((value) => [value.toLowerCase(), value])).values()];
  }, [listing]);

  const hasWantsContent = wantsCategories.length > 0 || wantsThings.length > 0;

  const description = listing?.description?.trim() ?? "";
  const canCollapseDescription = description.length > DESCRIPTION_COLLAPSE_CHARS;
  const visibleDescription =
    !canCollapseDescription || descriptionExpanded || !collapsedDescription
      ? description || "Описание не указано."
      : collapsedDescription;

  useLayoutEffect(() => {
    setDescriptionExpanded(false);
    const node = descriptionTextRef.current;
    if (!node) {
      setDescriptionFullHeight(0);
      setCollapsedDescription(null);
      return;
    }

    const fullText = description || "Описание не указано.";
    node.textContent = fullText;
    const fullHeight = node.scrollHeight;
    setDescriptionFullHeight(fullHeight);

    if (fullText.length <= DESCRIPTION_COLLAPSE_CHARS) {
      setCollapsedDescription(null);
      return;
    }

    setCollapsedDescription(
      truncateDescriptionAtWord(node, fullText, DESCRIPTION_COLLAPSED_HEIGHT),
    );
    node.textContent = fullText;
  }, [description, listing?.id]);

  const descriptionClipHeight =
    !canCollapseDescription || descriptionExpanded
      ? descriptionFullHeight
      : Math.min(DESCRIPTION_COLLAPSED_HEIGHT, descriptionFullHeight || DESCRIPTION_COLLAPSED_HEIGHT);

  const handleProposeExchange = () => {
    guardAuth("propose-exchange");
  };

  const handleCategoryClick = (
    categoryId: string,
    parentId: string | null,
    searchMode: "want" | "have",
    listingMode: "item" | "service",
  ) => {
    requestOpenHomeFilters({
      categoryParentId: parentId ?? categoryId,
      categoryChildId: parentId ? categoryId : undefined,
      searchMode,
      listingMode,
    });
    router.push("/#home-recommendations", { scroll: false });
  };

  const notFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="listing-detail-page min-h-screen bg-[#F8F8F5]">
      <Header />

      <main className="listing-detail-page__main mx-auto w-full max-w-[1440px] px-6 pb-16 pt-[102px]">
        {isLoading ? <ListingDetailSkeleton /> : null}

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
                  <div className="listing-detail-heading__text">
                    {categoryBreadcrumb.length > 0 ? (
                      <p className="listing-detail-heading__category">
                        {categoryBreadcrumb.map((category, index) => (
                          <button
                            key={category.id}
                            type="button"
                            className="listing-detail-heading__category-part"
                            onClick={() =>
                              handleCategoryClick(
                                category.id,
                                category.parentId,
                                "want",
                                listing.type,
                              )
                            }
                          >
                            {index > 0 ? (
                              <img
                                src="/images/listing-detail/category-chevron.svg"
                                alt=""
                                className="listing-detail-heading__category-chevron"
                              />
                            ) : null}
                            <span>{category.name}</span>
                          </button>
                        ))}
                      </p>
                    ) : null}
                    <h1 className="listing-detail-heading__title">{listing.title}</h1>
                  </div>
                  <ListingActionsMenu
                    listingId={listing.id}
                    isOwner={isOwner}
                    status={listing.status}
                  />
                </div>
                <div className="listing-detail-heading__tags">
                  <span className="listing-detail-pill">
                    <LocationPinIcon className="listing-detail-pill__location-icon" />
                    <span>{listing.city.name}</span>
                  </span>
                  {listing.hasDocuments ? (
                    <span className="listing-detail-pill">
                      <img
                        src="/images/listing-detail/document.svg"
                        alt=""
                        className="listing-detail-pill__document-icon"
                      />
                      <span>Документы</span>
                    </span>
                  ) : null}
                  {listing.type === "service"
                    ? listing.serviceFormats.map((format) => (
                        <span key={format} className="listing-detail-pill">
                          <img
                            src="/images/listing-detail/service-format-dot.svg"
                            alt=""
                            className="listing-detail-pill__format-icon"
                          />
                          <span>{mapServiceFormatToLabel(format)}</span>
                        </span>
                      ))
                    : null}
                </div>
              </div>

              <div className="listing-detail-stats">
                <article className="listing-detail-stat listing-detail-stat--price">
                  <p className="listing-detail-stat__label">Примерная стоимость</p>
                  <span className="listing-detail-stat__value">
                    {formatEstimatedPrice(listing.estimatedPrice)}
                  </span>
                </article>
                <article className="listing-detail-stat listing-detail-stat--condition">
                  <p className="listing-detail-stat__label">
                    {listing.type === "service" ? "Уровень работы" : "Состояние"}
                  </p>
                  <span className="listing-detail-stat__value">
                    {listing.type === "service"
                      ? mapServiceWorkLevelToLabel(listing.serviceWorkLevel)
                      : mapApiConditionToLabel(listing.condition)}
                  </span>
                </article>
                <article className="listing-detail-stat listing-detail-stat--extra">
                  <p className="listing-detail-stat__label">Доплата</p>
                  <span className="listing-detail-stat__value">
                    {EXTRA_PAY_LABELS[listing.extraPay]}
                  </span>
                </article>
              </div>

              <section className="listing-detail-wants" aria-label="Желаемый обмен">
                <h2 className="listing-detail-wants__title">Желаемый обмен</h2>
                <div className="listing-detail-wants__card">
                  {hasWantsContent ? (
                    <div className="listing-detail-wants__groups">
                      {wantsCategories.length > 0 ? (
                        <div className="listing-detail-wants__group">
                          <h3 className="listing-detail-wants__subtitle">Категории</h3>
                          <div className="listing-detail-wants__tags">
                            {wantsCategories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                className="listing-detail-wants__category"
                                onClick={() =>
                                  handleCategoryClick(
                                    category.id,
                                    category.parentId,
                                    "have",
                                    "item",
                                  )
                                }
                              >
                                {category.icon ? (
                                  <span
                                    className="listing-detail-wants__category-icon"
                                    aria-hidden
                                  >
                                    {category.icon}
                                  </span>
                                ) : null}
                                <span>{category.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {wantsThings.length > 0 ? (
                        <div className="listing-detail-wants__group">
                          <h3 className="listing-detail-wants__subtitle">Вещи и Услуги</h3>
                          <div className="listing-detail-wants__tags">
                            {wantsThings.map((tag) => (
                              <span key={tag} className="listing-detail-wants__tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="listing-detail-wants__tags">
                      <span className="listing-detail-wants__tag">Любые варианты</span>
                    </div>
                  )}
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

              <section className="listing-detail-description" aria-label="Описание">
                <h2 className="listing-detail-description__title">Описание</h2>
                <div className="listing-detail-description__card">
                  <div
                    className="listing-detail-description__clip"
                    style={{ maxHeight: descriptionClipHeight || undefined }}
                  >
                    <p
                      ref={descriptionTextRef}
                      className="listing-detail-description__text whitespace-pre-wrap"
                    >
                      {visibleDescription}
                    </p>
                  </div>
                  {canCollapseDescription ? (
                    <button
                      type="button"
                      className="listing-detail-description__more"
                      onClick={() => setDescriptionExpanded((value) => !value)}
                      aria-expanded={descriptionExpanded}
                    >
                      {descriptionExpanded ? "Свернуть" : "Дальше"}
                    </button>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {listing ? <ListingSimilarSection listingId={listing.id} /> : null}
      </main>
    </div>
  );
}
