"use client";

import { useEffect, type RefObject } from "react";

/** Gap between trigger and panel — matches profile sort (`pt-2`). */
export const DROPDOWN_ANCHOR_GAP = 8;

export const DROPDOWN_LIST_MAX_HEIGHT = 280;

export type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

/** Fixed position below the control — same anchor feel as profile sort popup. */
export function measureDropdownBelow(
  control: HTMLElement,
  maxHeight = DROPDOWN_LIST_MAX_HEIGHT,
): DropdownPosition {
  const rect = control.getBoundingClientRect();
  const vv = window.visualViewport;
  const viewTop = vv?.offsetTop ?? 0;
  const viewLeft = vv?.offsetLeft ?? 0;
  const viewHeight = vv?.height ?? window.innerHeight;
  const viewBottom = viewTop + viewHeight;

  const controlBottom = rect.bottom + viewTop;
  const controlLeft = rect.left + viewLeft;
  const spaceBelow = viewBottom - controlBottom - DROPDOWN_ANCHOR_GAP;
  const resolvedMaxHeight = Math.max(120, Math.min(maxHeight, spaceBelow));

  return {
    top: controlBottom + DROPDOWN_ANCHOR_GAP,
    left: controlLeft,
    width: rect.width,
    maxHeight: resolvedMaxHeight,
  };
}

export function useDropdownDismiss(
  open: boolean,
  onClose: () => void,
  rootRef: RefObject<HTMLElement | null>,
  panelRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef?.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("click", onOutsideClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onOutsideClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, rootRef, panelRef]);
}
