"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

import { COMPACT_HEADER_QUERY } from "./constants";

const PANEL_CLOSE_MS = 220;

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
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useScrollLock(open && isCompact, containerRef);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => {
      setIsMounted(false);
    }, PANEL_CLOSE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative flex h-[32px] items-center overflow-visible">
      {trigger}
      {isMounted ? (
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
