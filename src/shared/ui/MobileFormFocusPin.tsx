"use client";

import { useEffect } from "react";

import { MQ } from "@/shared/lib/breakpoints";
import { pinScrollAroundFocus } from "@/shared/lib/pin-window-scroll";
import { useMediaQuery } from "@/shared/lib/use-media-query";

function isTextFormControl(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  const type = (target.type || "text").toLowerCase();
  return ![
    "checkbox",
    "radio",
    "range",
    "file",
    "button",
    "submit",
    "reset",
    "hidden",
    "image",
  ].includes(type);
}

function shouldSkipPin(target: HTMLElement): boolean {
  // Auth has its own keyboard scroll assist.
  if (target.closest(".auth-page-shell")) return true;
  return false;
}

/**
 * Site-wide iOS / compact: prevent the page from jumping (feels like zoom)
 * when tapping inputs and combobox fields.
 */
export function MobileFormFocusPin() {
  const isCompact = useMediaQuery(MQ.compact);

  useEffect(() => {
    if (!isCompact) return;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!isTextFormControl(target)) return;
      if (shouldSkipPin(target)) return;
      pinScrollAroundFocus();
    };

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [isCompact]);

  return null;
}
