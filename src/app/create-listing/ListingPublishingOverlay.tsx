"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

type ListingPublishingOverlayProps = {
  open: boolean;
  title: string;
  subtitle?: string;
};

export function ListingPublishingOverlay({
  open,
  title,
  subtitle = "Это займёт несколько секунд",
}: ListingPublishingOverlayProps) {
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
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(26,26,26,0.45)] px-4 backdrop-blur-[2px] overlay-backdrop${isVisible ? " is-open" : ""}`}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-hidden={!isVisible}
      aria-label={title}
    >
      <div
        className={`flex w-full max-w-[360px] flex-col items-center gap-4 rounded-[21px] bg-white px-8 py-10 text-center shadow-[0_16px_48px_rgba(15,23,42,0.18)] overlay-pop${isVisible ? " is-open" : ""}`}
      >
        <span
          className="box-border h-10 w-10 animate-spin rounded-full border-[3px] border-[#E8E8EE] border-t-[#8E8BED]"
          aria-hidden
        />
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-[18px] font-semibold leading-[130%] tracking-[-0.01em] text-[#1A1A1A]">
            {title}
          </p>
          {subtitle ? (
            <p className="m-0 text-[14px] font-normal leading-[160%] text-[#626262]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
