import { layout } from "@/shared/config/tokens";

export const CARD_WIDTH = layout.cardWidth;
export const CARD_GAP = layout.cardGap;
export const CARD_STEP = CARD_WIDTH + CARD_GAP;
export const VISIBLE_CARD_COUNT = 2;
export const SECTION_WIDTH = layout.containerHome;
/** Figma free section panel with muted background. */
export const PANEL_WIDTH = 1440;
export const PANEL_HEIGHT = 491;
/** (491 − 443) / 2 — content band matches free cards / promo. */
export const PANEL_PADDING = 24;
/**
 * Must equal CARD_GAP. At snap stops the side gutters then show only the
 * inter-card gap — never a sliver of the previous/next card.
 */
export const CAROUSEL_EDGE_PADDING = CARD_GAP;
/**
 * Covers subpixel peeks + resting card shadow blur (~5px) at the
 * outer gutters without eating into the visible cards.
 */
export const CAROUSEL_EDGE_MASK = 5;
/**
 * Vertical room for hover shadows. Applied as padding + negative margin
 * so layout height stays equal to the cards (promo matches).
 */
export const CAROUSEL_SHADOW_Y_PADDING = 16;

/** Free listing cards + promo share this height (panel content band). */
export const FREE_CARD_HEIGHT = 443;

/** Exactly two cards + one gap. */
export const CAROUSEL_VISIBLE_WIDTH = CARD_WIDTH * VISIBLE_CARD_COUNT + CARD_GAP;
/** Layout width including side gutters. */
export const CAROUSEL_OUTER_WIDTH = CAROUSEL_VISIBLE_WIDTH + CAROUSEL_EDGE_PADDING * 2;
/** Remaining width beside carousel inside the padded panel. */
export const PROMO_WIDTH =
  PANEL_WIDTH - PANEL_PADDING * 2 - CAROUSEL_OUTER_WIDTH - CARD_GAP;
export const PROMO_HEIGHT = FREE_CARD_HEIGHT;

export const CAROUSEL_SCROLL_END_FALLBACK_MS = 150;
export const CAROUSEL_AUTO_ADVANCE_MS = 5000;

export function getCarouselSetWidth(itemCount: number) {
  if (itemCount <= 0) return 0;
  return itemCount * CARD_STEP;
}
