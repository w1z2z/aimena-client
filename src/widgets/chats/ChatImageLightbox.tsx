"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { ChatMessageAttachment } from "@/shared/api/chats";

type Props = {
  images: ChatMessageAttachment[];
  startIndex: number;
  onClose: () => void;
};

export function ChatImageLightbox({ images, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const canNavigate = images.length > 1;
  const active = images[index] ?? images[0];

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!canNavigate) return;
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % images.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [canNavigate, images.length, onClose]);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="listing-detail-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Фото ${index + 1} из ${images.length}`}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Закрыть"
        className="listing-detail-lightbox__close"
        onClick={onClose}
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
              setIndex((current) => (current - 1 + images.length) % images.length);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Следующее фото"
            className="listing-detail-lightbox__nav listing-detail-lightbox__nav--next"
            onClick={(event) => {
              event.stopPropagation();
              setIndex((current) => (current + 1) % images.length);
            }}
          >
            ›
          </button>
          <span className="listing-detail-lightbox__counter">
            {index + 1}/{images.length}
          </span>
        </>
      ) : null}

      <div
        className="listing-detail-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.fullUrl || active.url}
          alt={active.fileName}
          className="listing-detail-lightbox__image"
          onClick={(event) => event.stopPropagation()}
        />
        {active.sourceListingId ? (
          <p className="chats-lightbox-caption">Документ объявления</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
