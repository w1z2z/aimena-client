"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

import { COMPACT_HEADER_QUERY } from "./constants";

type HeaderDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  panelLabel: string;
};

export function HeaderDropdown({ open, onOpenChange, trigger, children, panelLabel }: HeaderDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
  const { isRendered, isVisible } = useOverlayPresence(open);

  useScrollLock(isRendered && isCompact, containerRef);

  useEffect(() => {
    if (!isVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onOpenChange]);

  return (
    <div ref={containerRef} className="relative flex h-[32px] items-center overflow-visible">
      {trigger}
      {isRendered ? (
        <>
          {isCompact ? (
            <button
              type="button"
              aria-label={`Закрыть: ${panelLabel}`}
              tabIndex={isVisible ? 0 : -1}
              className={`header-dropdown-sheet-backdrop ${isVisible ? "is-open" : ""}`}
              onClick={() => onOpenChange(false)}
            />
          ) : null}
          <div
            id={panelId}
            role="dialog"
            aria-label={panelLabel}
            aria-hidden={!isVisible}
            className={
              isCompact
                ? `header-dropdown-panel header-dropdown-panel--sheet ${isVisible ? "is-open" : ""}`
                : `header-dropdown-panel absolute right-0 top-[calc(100%+6px)] z-[60] ${isVisible ? "is-open" : ""}`
            }
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}
