"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

type ListingPublishedModalProps = {
  open: boolean;
};

export function ListingPublishedModal({ open }: ListingPublishedModalProps) {
  const { isRendered, isVisible } = useOverlayPresence(open);

  useEffect(() => {
    if (!isRendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRendered]);

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`listing-published-modal${isVisible ? " is-visible" : ""}`}
      role="presentation"
    >
      <div
        className="listing-published-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-published-title"
        aria-describedby="listing-published-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="listing-published-title" className="listing-published-modal__title">
          Ваше объявление успешно опубликовано!
        </h2>

        <p id="listing-published-subtitle" className="listing-published-modal__subtitle">
          Теперь можете начинать обмениваться с другими!
        </p>

        <Link href="/" className="listing-published-modal__button">
          Вернуться в ленту
        </Link>
      </div>
    </div>,
    document.body,
  );
}
