/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, type Ref } from "react";
import { createPortal } from "react-dom";

import { useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { CarouselNavButton } from "@/shared/ui/CarouselNavButton";
import { ChevronIcon, HeartIcon } from "@/shared/ui/icons";

type GalleryImage = {
  id: string;
  url: string;
  fullUrl?: string;
};

type ListingGalleryProps = {
  listingId: string;
  title: string;
  images: GalleryImage[];
  isFavorite: boolean;
  hideFavorite?: boolean;
  imageMuted?: boolean;
  /** Bottom edge used to align the collapsed description on the right. */
  alignTargetRef?: Ref<HTMLDivElement | null>;
};

export function ListingGallery({
  listingId,
  title,
  images,
  isFavorite,
  hideFavorite = false,
  imageMuted = false,
  alignTargetRef,
}: ListingGalleryProps) {
  const { guardAuth } = useAuthGate();
  const favoriteMutation = useFavoriteToggle();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const favorite = favoriteOverride ?? isFavorite;
  const slides = images.length > 0 ? images : [{ id: "placeholder", url: LISTING_PLACEHOLDER_IMAGE }];
  const safeIndex = Math.min(activeIndex, slides.length - 1);
  const active = slides[safeIndex] ?? slides[0];
  const canNavigate = slides.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [listingId]);

  useEffect(() => {
    if (favoriteOverride !== null && favoriteOverride === isFavorite) {
      setFavoriteOverride(null);
    }
  }, [favoriteOverride, isFavorite]);

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (!canNavigate) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // Navigation helpers only depend on slides.length via setActiveIndex functional updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, canNavigate, slides.length]);

  const handleFavoriteClick = () => {
    if (hideFavorite || favoriteMutation.isPending || favoriteOverride !== null) return;

    guardAuth("favorites", () => {
      const previous = favorite;
      setFavoriteOverride(!previous);
      favoriteMutation.mutate(
        { listingId, isFavorite: previous },
        {
          onError: () => setFavoriteOverride(null),
        },
      );
    });
  };

  const lightbox =
    lightboxOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="listing-detail-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${title}: фото ${safeIndex + 1} из ${slides.length}`}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              aria-label="Закрыть"
              className="listing-detail-lightbox__close"
              onClick={() => setLightboxOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="M2 2L16 16M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {canNavigate ? (
              <>
                <button
                  type="button"
                  aria-label="Предыдущее фото"
                  className="listing-detail-lightbox__nav listing-detail-lightbox__nav--prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                >
                  <ChevronIcon direction="left" className="h-[25px] w-[15px] text-brand" />
                </button>
                <button
                  type="button"
                  aria-label="Следующее фото"
                  className="listing-detail-lightbox__nav listing-detail-lightbox__nav--next"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                >
                  <ChevronIcon direction="right" className="h-[25px] w-[15px] text-brand" />
                </button>
                <span className="listing-detail-lightbox__counter">
                  {safeIndex + 1}/{slides.length}
                </span>
              </>
            ) : null}

            <div
              className="listing-detail-lightbox__stage"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={active.fullUrl ?? active.url}
                alt={title}
                className="listing-detail-lightbox__image"
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={[
        "listing-detail-gallery",
        imageMuted ? "listing-detail-gallery--muted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="listing-detail-gallery__main">
        <button
          type="button"
          className="listing-detail-gallery__open"
          aria-label="Открыть фото на весь экран"
          onClick={() => setLightboxOpen(true)}
        >
          <img src={active.url} alt={title} className="listing-detail-gallery__image" />
        </button>

        {hideFavorite ? null : (
          <button
            type="button"
            aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
            aria-pressed={favorite}
            className="listing-detail-gallery__favorite"
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
          >
            <HeartIcon
              className={`h-[20px] w-[22px] ${favorite ? "text-[#FF2056]" : "text-[#626262]"}`}
              fill={favorite ? "currentColor" : "none"}
            />
          </button>
        )}

        {canNavigate ? (
          <>
            <CarouselNavButton
              direction="left"
              label="Предыдущее фото"
              onClick={goPrev}
              className="listing-detail-gallery__nav listing-detail-gallery__nav--prev"
            />
            <CarouselNavButton
              direction="right"
              label="Следующее фото"
              onClick={goNext}
              className="listing-detail-gallery__nav listing-detail-gallery__nav--next"
            />
            <span className="listing-detail-gallery__counter">
              {safeIndex + 1}/{slides.length}
            </span>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div
          ref={alignTargetRef}
          className="listing-detail-gallery__thumbs"
          role="list"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="listitem"
              aria-label={`Фото ${index + 1}`}
              aria-current={index === safeIndex}
              className={[
                "listing-detail-gallery__thumb",
                index === safeIndex ? "listing-detail-gallery__thumb--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveIndex(index)}
            >
              <img src={slide.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox}
    </div>
  );
}
