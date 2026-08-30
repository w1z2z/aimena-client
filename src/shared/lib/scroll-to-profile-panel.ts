import { MQ } from "@/shared/lib/breakpoints";

import { forcePageScrollTop } from "@/shared/ui/ScrollToTopOnRouteChange";

function scrollToElement(target: HTMLElement, behavior: ScrollBehavior) {
  target.scrollIntoView({ behavior, block: "start" });
}

/**
 * On mobile profile tabs, land on the panel title (e.g. «Ваши объявления»)
 * instead of the very top of the page (sidebar / avatar).
 */
export function scrollToProfilePanelTitle(
  anchor: HTMLElement | null,
  options?: { behavior?: ScrollBehavior },
) {
  if (typeof window === "undefined") return;

  const behavior = options?.behavior ?? "auto";
  const isMobile = window.matchMedia(MQ.tablet).matches;

  if (!isMobile) {
    forcePageScrollTop();
    return;
  }

  const panel = anchor?.closest(".profile-panel");
  const target =
    panel?.querySelector<HTMLElement>(".profile-panel__title") ??
    panel?.querySelector<HTMLElement>(".profile-panel__header");

  if (!target) {
    forcePageScrollTop();
    return;
  }

  const scroll = () => scrollToElement(target, behavior);

  window.requestAnimationFrame(scroll);
  window.setTimeout(scroll, 80);
}
