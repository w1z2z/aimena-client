/** Switch to compact header (burger) at this width and below.
 * Above this, desktop flex layout keeps categories/CTA and shrinks search. */
export const COMPACT_HEADER_MAX_WIDTH_PX = 1024;

export const COMPACT_HEADER_QUERY = `(max-width: ${COMPACT_HEADER_MAX_WIDTH_PX}px)`;

/** Desktop profile / notifications panel width — compact sheets must not exceed this. */
export const HEADER_DROPDOWN_WIDTH_PX = 412;

/** Compact search field max width (desktop expanded search is ~660px; keep under that). */
export const HEADER_COMPACT_SEARCH_MAX_WIDTH_PX = 560;

export {
  OVERLAY_ANIMATION_MS,
  OVERLAY_ANIMATION_EASE,
} from "@/shared/lib/overlay-animation";
