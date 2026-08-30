/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import { useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
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

const THUMBS_VISIBLE = 6;

function ThumbStripChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className={[
        "listing-detail-gallery__thumbs-nav-icon",
        direction === "left" ? "is-prev" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      width="16"
      height="25"
      viewBox="0 0 16 25"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.875 22.5L13.125 12.25L2.875 2"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const { isRendered: lightboxRendered, isVisible: lightboxVisible } =
    useOverlayPresence(lightboxOpen);
  const thumbsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollThumbsLeft, setCanScrollThumbsLeft] = useState(false);
  const [canScrollThumbsRight, setCanScrollThumbsRight] = useState(false);

  const favorite = favoriteOverride ?? isFavorite;
  const slides = images.length > 0 ? images : [{ id: "placeholder", url: LISTING_PLACEHOLDER_IMAGE }];
  const safeIndex = Math.min(activeIndex, slides.length - 1);
  const active = slides[safeIndex] ?? slides[0];
  const canNavigate = slides.length > 1;
  const showThumbsNav = slides.length > THUMBS_VISIBLE;

  const syncThumbsScrollState = useCallback(() => {
    const track = thumbsTrackRef.current;
    if (!track) {
      setCanScrollThumbsLeft(false);
      setCanScrollThumbsRight(false);
      return;
    }

    const vertical = getComputedStyle(track).flexDirection.startsWith("column");
    if (vertical) {
      const maxScroll = track.scrollHeight - track.clientHeight;
      setCanScrollThumbsLeft(track.scrollTop > 2);
      setCanScrollThumbsRight(maxScroll - track.scrollTop > 2);
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollThumbsLeft(track.scrollLeft > 2);
    setCanScrollThumbsRight(maxScroll - track.scrollLeft > 2);
  }, []);

  const scrollActiveThumbIntoView = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const track = thumbsTrackRef.current;
      if (!track) return;

      const activeThumb = track.querySelector<HTMLElement>(
        `[data-thumb-index="${safeIndex}"]`,
      );
      if (!activeThumb) return;

      const trackRect = track.getBoundingClientRect();
      const thumbRect = activeThumb.getBoundingClientRect();
      const vertical = getComputedStyle(track).flexDirection.startsWith("column");

      if (vertical) {
        const topOverflow = thumbRect.top - trackRect.top;
        const bottomOverflow = thumbRect.bottom - trackRect.bottom;
        if (topOverflow < 0) {
          track.scrollBy({ top: topOverflow, behavior });
        } else if (bottomOverflow > 0) {
          track.scrollBy({ top: bottomOverflow, behavior });
        }
      } else {
        const leftOverflow = thumbRect.left - trackRect.left;
        const rightOverflow = thumbRect.right - trackRect.right;
        if (leftOverflow < 0) {
          track.scrollBy({ left: leftOverflow, behavior });
        } else if (rightOverflow > 0) {
          track.scrollBy({ left: rightOverflow, behavior });
        }
      }

      window.requestAnimationFrame(syncThumbsScrollState);
    },
    [safeIndex, syncThumbsScrollState],
  );

  const scrollThumbsByPage = (direction: -1 | 1) => {
    const track = thumbsTrackRef.current;
    if (!track) return;
    const vertical = getComputedStyle(track).flexDirection.startsWith("column");
    if (vertical) {
      track.scrollBy({ top: direction * track.clientHeight, behavior: "smooth" });
      return;
    }
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [listingId]);

  useEffect(() => {
    if (favoriteOverride !== null && favoriteOverride === isFavorite) {
      setFavoriteOverride(null);
    }
  }, [favoriteOverride, isFavorite]);

  useLayoutEffect(() => {
    scrollActiveThumbIntoView(safeIndex === 0 ? "auto" : "smooth");
  }, [safeIndex, scrollActiveThumbIntoView]);

  useEffect(() => {
    const track = thumbsTrackRef.current;
    if (!track) return;

    syncThumbsScrollState();
    track.addEventListener("scroll", syncThumbsScrollState, { passive: true });
    window.addEventListener("resize", syncThumbsScrollState);

    const frameId = window.requestAnimationFrame(syncThumbsScrollState);
    return () => {
      track.removeEventListener("scroll", syncThumbsScrollState);
      window.removeEventListener("resize", syncThumbsScrollState);
      window.cancelAnimationFrame(frameId);
    };
  }, [slides.length, syncThumbsScrollState]);

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  useEffect(() => {
    if (!lightboxRendered) return;

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
  }, [lightboxRendered, canNavigate, slides.length]);

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
    lightboxRendered && typeof document !== "undefined"
      ? createPortal(
          <div
            className={`listing-detail-lightbox overlay-backdrop${lightboxVisible ? " is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!lightboxVisible}
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
              className={`listing-detail-lightbox__stage overlay-pop${lightboxVisible ? " is-open" : ""}`}
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
        <div ref={alignTargetRef} className="listing-detail-gallery__thumbs-wrap">
          <div className="listing-detail-gallery__thumbs-viewport">
            <div
              ref={thumbsTrackRef}
              className="listing-detail-gallery__thumbs"
              role="list"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="listitem"
                  data-thumb-index={index}
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

            {showThumbsNav ? (
              <>
                <button
                  type="button"
                  aria-label="Предыдущие миниатюры"
                  className="listing-detail-gallery__thumbs-nav listing-detail-gallery__thumbs-nav--prev"
                  disabled={!canScrollThumbsLeft}
                  onClick={() => scrollThumbsByPage(-1)}
                >
                  <ThumbStripChevron direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Следующие миниатюры"
                  className="listing-detail-gallery__thumbs-nav listing-detail-gallery__thumbs-nav--next"
                  disabled={!canScrollThumbsRight}
                  onClick={() => scrollThumbsByPage(1)}
                >
                  <ThumbStripChevron direction="right" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {lightbox}
    </div>
  );
}
