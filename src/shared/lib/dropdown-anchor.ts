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

export type AnchoredDropdownPosition = {
  top: number;
  left: number;
};

const ANCHORED_DROPDOWN_PADDING = 16;

export type AnchoredDropdownAlign = "left" | "center" | "right";

export type MeasureAnchoredDropdownOptions = {
  gap?: number;
  padding?: number;
  /** Profile sort / listing menu — right edge under trigger. */
  align?: AnchoredDropdownAlign;
};

/** Fixed dropdown under trigger, clamped to viewport (portal menus on scaled cards). */
export function measureAnchoredDropdown(
  trigger: HTMLElement,
  panel: HTMLElement,
  options: MeasureAnchoredDropdownOptions = {},
): AnchoredDropdownPosition {
  const gap = options.gap ?? DROPDOWN_ANCHOR_GAP;
  const padding = options.padding ?? ANCHORED_DROPDOWN_PADDING;
  const align = options.align ?? "right";

  const triggerRect = trigger.getBoundingClientRect();
  const panelWidth = panel.offsetWidth;
  const panelHeight = panel.offsetHeight;

  let top = triggerRect.bottom + gap;
  let left =
    align === "center"
      ? triggerRect.left + triggerRect.width / 2 - panelWidth / 2
      : align === "right"
        ? triggerRect.right - panelWidth
        : triggerRect.left;

  const viewWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewHeight = window.visualViewport?.height ?? window.innerHeight;
  const viewLeft = window.visualViewport?.offsetLeft ?? 0;
  const viewTop = window.visualViewport?.offsetTop ?? 0;

  const minLeft = viewLeft + padding;
  const maxLeft = viewLeft + viewWidth - padding - panelWidth;
  left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

  const minTop = viewTop + padding;
  const maxTop = viewTop + viewHeight - padding - panelHeight;
  if (top > maxTop) {
    top = triggerRect.top - gap - panelHeight;
  }
  top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));

  return { top, left };
}

/** Fixed position below the control, right edges aligned — profile listing menu, sort popup. */
export function measureDropdownBelowRight(
  control: HTMLElement,
  gap = DROPDOWN_ANCHOR_GAP,
): { top: number; right: number } {
  const rect = control.getBoundingClientRect();
  return {
    top: rect.bottom + gap,
    right: window.innerWidth - rect.right,
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

    const onScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node) {
        if (rootRef.current?.contains(target)) return;
        if (panelRef?.current?.contains(target)) return;
      }
      onClose();
    };

    window.addEventListener("click", onOutsideClick);
    window.addEventListener("keydown", onKeyDown);

    const timeoutId = window.setTimeout(() => {
      window.addEventListener("scroll", onScroll, true);
      window.visualViewport?.addEventListener("scroll", onScroll);
    }, 80);

    return () => {
      window.removeEventListener("click", onOutsideClick);
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("scroll", onScroll);
    };
  }, [open, onClose, rootRef, panelRef]);
}
