/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

import { useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { ChevronIcon, HeartIcon } from "@/shared/ui/icons";

type GalleryImage = {
  id: string;
  url: string;
};

type ListingGalleryProps = {
  listingId: string;
  title: string;
  images: GalleryImage[];
  isFavorite: boolean;
  hideFavorite?: boolean;
  imageMuted?: boolean;
};

export function ListingGallery({
  listingId,
  title,
  images,
  isFavorite,
  hideFavorite = false,
  imageMuted = false,
}: ListingGalleryProps) {
  const { guardAuth } = useAuthGate();
  const favoriteMutation = useFavoriteToggle();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const favorite = favoriteOverride ?? isFavorite;
  const slides = images.length > 0 ? images : [{ id: "placeholder", url: LISTING_PLACEHOLDER_IMAGE }];
  const safeIndex = Math.min(activeIndex, slides.length - 1);
  const active = slides[safeIndex] ?? slides[0];

  useEffect(() => {
    setActiveIndex(0);
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
        <img src={active.url} alt={title} className="listing-detail-gallery__image" />

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

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              className="listing-detail-gallery__nav listing-detail-gallery__nav--prev"
              onClick={goPrev}
            >
              <ChevronIcon direction="left" className="h-[25px] w-[15px] text-brand" />
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              className="listing-detail-gallery__nav listing-detail-gallery__nav--next"
              onClick={goNext}
            >
              <ChevronIcon direction="right" className="h-[25px] w-[15px] text-brand" />
            </button>
            <span className="listing-detail-gallery__counter">
              {safeIndex + 1}/{slides.length}
            </span>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="listing-detail-gallery__thumbs" role="list">
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
    </div>
  );
}
