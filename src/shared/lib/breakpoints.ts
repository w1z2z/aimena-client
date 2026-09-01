/**
 * Canonical layout breakpoints for the whole app.
 * Keep CSS `@media` values in sync with these numbers
 * (see comment in `app/globals.css`).
 *
 * | token    | px   | use                                      |
 * |----------|------|------------------------------------------|
 * | phone    | 480  | tight padding / type                     |
 * | sm       | 640  | forms, stacked detail, narrow columns    |
 * | compact  | 1024 | chrome: header burger / bottom nav       |
 * | tablet   | 1120 | content grids, page reflow               |
 * | wide     | 1480 | multi-column card grids (4 → 3)          |
 *
 * Header inset ladders use min-width 1280 (floating-chat) —
 * those are not layout mode switches.
 */

export const BP = {
  phone: 480,
  sm: 640,
  compact: 1024,
  tablet: 1120,
  wide: 1480,
} as const;

export type BreakpointName = keyof typeof BP;

export const MQ = {
  /** max-width: phone */
  phone: `(max-width: ${BP.phone}px)`,
  /** max-width: sm */
  sm: `(max-width: ${BP.sm}px)`,
  /** max-width: compact — header burger / bottom nav */
  compact: `(max-width: ${BP.compact}px)`,
  /** max-width: tablet — content reflow */
  tablet: `(max-width: ${BP.tablet}px)`,
  /** max-width: wide — card grid column drop */
  wide: `(max-width: ${BP.wide}px)`,
} as const;

/** @deprecated Prefer `BP.compact` / `MQ.compact` */
export const COMPACT_HEADER_MAX_WIDTH_PX = BP.compact;

/** @deprecated Prefer `MQ.compact` */
export const COMPACT_HEADER_QUERY = MQ.compact;
