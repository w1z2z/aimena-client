/** Switch to compact header (burger / flex bar) at this width and below. */
export const COMPACT_HEADER_MAX_WIDTH_PX = 1500;

export const COMPACT_HEADER_QUERY = `(max-width: ${COMPACT_HEADER_MAX_WIDTH_PX}px)`;

/** Desktop profile / notifications panel width — compact sheets must not exceed this. */
export const HEADER_DROPDOWN_WIDTH_PX = 412;

/** Compact search field max width (desktop expanded search is ~660px; keep under that). */
export const HEADER_COMPACT_SEARCH_MAX_WIDTH_PX = 560;
