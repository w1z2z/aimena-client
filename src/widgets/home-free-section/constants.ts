import { layout } from "@/shared/config/tokens";

export const CARD_WIDTH = layout.cardWidth;
export const CARD_GAP = layout.cardGap;
export const CARD_STEP = CARD_WIDTH + CARD_GAP;
export const VISIBLE_CARD_COUNT = 2;
export const SECTION_WIDTH = layout.containerHome;
export const PANEL_PADDING = 28;

export const CAROUSEL_VISIBLE_WIDTH = CARD_WIDTH * VISIBLE_CARD_COUNT + CARD_GAP;
export const PROMO_WIDTH = SECTION_WIDTH - PANEL_PADDING * 2 - CAROUSEL_VISIBLE_WIDTH - CARD_GAP;

export const CAROUSEL_SCROLL_END_FALLBACK_MS = 150;
export const CAROUSEL_AUTO_ADVANCE_MS = 5000;

export function getCarouselSetWidth(itemCount: number) {
  if (itemCount <= 0) return 0;
  return itemCount * CARD_STEP;
}
