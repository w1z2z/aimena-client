import { placeholders } from "@/shared/config/tokens";

export type Mode = "exchange" | "browse";

export const HERO_CONTENT_SHIFT_UP = 80;
export const BASE_SCENE_WIDTH = 1920;
export const BASE_SCENE_HEIGHT = 1080;
/** Desktop content band inside the 1920 scene (`left 240` + `w-[1440px]`). */
export const HERO_CONTENT_WIDTH = 1440;

/**
 * Fit the full scene (including bottom ticker) into the viewport.
 * Width reference is the 1440 content band — do not shrink from 1920 margins.
 * Never crop the scene height; scale down instead when the screen is shorter.
 */
export function computeDesktopSceneScale(viewportWidth: number, viewportHeight: number): number {
  const widthScale = Math.max(viewportWidth, 320) / HERO_CONTENT_WIDTH;
  const heightScale = Math.max(viewportHeight, 320) / BASE_SCENE_HEIGHT;
  return Math.min(1, widthScale, heightScale);
}

export const titlePlaceholder = placeholders.listingTitle;
export const cityPlaceholder = "Начните вводить город";
