"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

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
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

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
    <div ref={containerRef} className="relative">
      {trigger}
      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={panelLabel}
          aria-hidden={!isVisible}
          className={`header-dropdown-panel absolute right-0 top-[calc(100%+6px)] z-[60] ${isVisible ? "is-open" : ""}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
