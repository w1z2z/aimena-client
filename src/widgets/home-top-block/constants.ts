import { layout, placeholders } from "@/shared/config/tokens";

export type Mode = "exchange" | "browse" | "all";

export const BASE_SCENE_WIDTH = layout.heroSceneWidth;
export const HERO_CONTENT_SHIFT_UP = 99;
export const BASE_SCENE_HEIGHT = 1330 - HERO_CONTENT_SHIFT_UP;

export const fieldClassName =
  "rounded-[10px] border border-[#CACACA] bg-white px-[12px] font-semibold text-[#3D3D3D] outline-none placeholder:text-[#626262]";

export const MODE_COLORED_HEIGHT_EXCHANGE = 340;
export const MODE_COLORED_HEIGHT_BROWSE = 535;
export const MODE_WHITE_PANEL_HEIGHT = 183;
export const MODE_PANEL_GAP = 12;
export const MODE_PANEL_DURATION = 680;

export const titlePlaceholder = placeholders.listingTitle;
export const pricePlaceholder = placeholders.listingPrice;
export const cityPlaceholder = placeholders.city;
