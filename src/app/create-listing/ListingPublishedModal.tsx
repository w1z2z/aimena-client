"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const TRANSITION_MS = 320;

type ListingPublishedModalProps = {
  open: boolean;
};

export function ListingPublishedModal({ open }: ListingPublishedModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);

      const frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!mounted || open) return;

    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`listing-published-modal${visible ? " is-visible" : ""}`}
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
