/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import type { HomeCategoryItem } from "@/features/home-search/types";
import { categoryItems, getCategoryIconSrc } from "@/shared/ui/icons";

import { useIsSafari } from "./lib/safari";

function normalizeIndex(index: number, length: number) {
  if (length <= 0) return 0;
  const result = index % length;
  return result < 0 ? result + length : result;
}

function getWrappedDistanceFloat(index: number, activeIndex: number, length: number) {
  let rawDistance = index - activeIndex;
  while (rawDistance > length / 2) rawDistance -= length;
  while (rawDistance < -length / 2) rawDistance += length;
  return rawDistance;
}

function getShortestDelta(from: number, to: number, length: number) {
  let delta = to - from;
  if (delta > length / 2) delta -= length;
  if (delta < -length / 2) delta += length;
  return delta;
}

function rebaseDisplayIndexContinuous(displayIndex: number, length: number) {
  const nearest = Math.round(displayIndex);
  const settled = normalizeIndex(nearest, length);
  const fraction = displayIndex - nearest;
  return settled + fraction;
}

const ARC_CENTER_X = 720;
const ARC_HORIZONTAL_RADIUS = 620;
const ARC_VERTICAL_RADIUS = 170;
const ARC_BASE_Y = 218;
const ARC_CONTAINER_TOP = -20;
const ARC_CONTAINER_HEIGHT = 188;
const ARC_ACTIVE_ICON_SIZE = 102;
const ARC_GLOW_HORIZONTAL_RADIUS = 735;
const ARC_ANGLE_STEP = 17.5;
const ARC_ACTIVE_ICON_CENTER_Y = ARC_BASE_Y - ARC_VERTICAL_RADIUS + ARC_ACTIVE_ICON_SIZE / 2;
const ARC_GLOW_BASE_Y = ARC_ACTIVE_ICON_CENTER_Y + ARC_VERTICAL_RADIUS;
const ARC_GLOW_PATH = `M ${ARC_CENTER_X - ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y} A ${ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_VERTICAL_RADIUS} 0 0 1 ${ARC_CENTER_X + ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y}`;
const CATEGORY_DRAG_CLICK_THRESHOLD = 6;
const CATEGORY_DRAG_PIXELS_PER_STEP = 88;
const CATEGORY_ACTIVE_SCALE_BOOST = 0.05;
const CATEGORY_ACTIVE_SIZE_BOOST = 6;
const CATEGORY_ACTIVE_LABEL_BOOST = 1;

const CATEGORY_ICON_ACTIVE_SHADOW = "drop-shadow(0 10px 24px rgba(200, 255, 0, 0.35))";
const CATEGORY_ICON_INACTIVE_SHADOW = "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35))";
const CATEGORY_ICON_FALLBACK_BY_ID: Record<string, string> = Object.fromEntries(
  categoryItems.map((item) => [item.id, getCategoryIconSrc(item.icon)]),
);

function getCategoryIconFilter(isActive: boolean, useSvgFilter: boolean) {
  if (useSvgFilter) {
    return isActive ? "url(#category-icon-shadow-active)" : "url(#category-icon-shadow-inactive)";
  }

  return isActive ? CATEGORY_ICON_ACTIVE_SHADOW : CATEGORY_ICON_INACTIVE_SHADOW;
}

type CategoryLayout = {
  x: number;
  y: number;
  scale: number;
  iconSize: number;
  opacity: number;
  isFar: boolean;
  isActive: boolean;
  labelSize: number;
  labelOpacity: number;
};

function computeCategoryLayout(index: number, displayIndex: number, length: number): CategoryLayout {
  const distance = getWrappedDistanceFloat(index, displayIndex, length);
  const maxVisibleDistance = 4;
  const distanceFactor = Math.min(1, Math.abs(distance) / maxVisibleDistance);
  const isFar = Math.abs(distance) > maxVisibleDistance + 0.05;
  const angle = distance * ARC_ANGLE_STEP;
  const rad = (angle * Math.PI) / 180;
  const centerProximity = Math.max(0, 1 - Math.abs(distance) / 0.45);
  const scale = 1 - distanceFactor * 0.42 + centerProximity * CATEGORY_ACTIVE_SCALE_BOOST;
  const iconSize = 102 - distanceFactor * 64 + centerProximity * CATEGORY_ACTIVE_SIZE_BOOST;
  const arcTopY = ARC_BASE_Y - Math.cos(rad) * ARC_VERTICAL_RADIUS;
  const scaledIconHeight = iconSize * scale;

  return {
    x: ARC_CENTER_X + Math.sin(rad) * ARC_HORIZONTAL_RADIUS,
    y: arcTopY - (scaledIconHeight - ARC_ACTIVE_ICON_SIZE) / 2,
    scale,
    iconSize,
    opacity: isFar ? 0 : 1 - distanceFactor * 0.5,
    isFar,
    isActive: Math.abs(distance) < 0.05,
    labelSize: Math.max(10, 14 - distanceFactor * 6) + centerProximity * CATEGORY_ACTIVE_LABEL_BOOST,
    labelOpacity: Math.abs(distance) < 0.05 ? 1 : 0.8,
  };
}

type CategoryItemRefs = {
  button: HTMLButtonElement;
  iconWrap: HTMLElement;
  img: HTMLImageElement;
  label: HTMLElement;
};

function applyCategoryLayout(
  refs: CategoryItemRefs,
  layout: CategoryLayout,
  useSvgIconFilter: boolean,
  options?: { skipFilters?: boolean; skipAria?: boolean },
) {
  const { button, iconWrap, img, label } = refs;
  const skipFilters = options?.skipFilters ?? false;
  const skipAria = options?.skipAria ?? false;

  button.style.left = `${layout.x}px`;
  button.style.top = `${layout.y}px`;
  button.style.transform = "translateX(-50%)";
  button.style.opacity = String(layout.opacity);
  button.style.pointerEvents = layout.isFar ? "none" : "auto";

  iconWrap.style.transform = `scale(${layout.scale})`;
  iconWrap.style.transformOrigin = "top center";

  img.style.width = `${layout.iconSize}px`;
  img.style.height = `${layout.iconSize}px`;

  if (!skipFilters) {
    const filter = getCategoryIconFilter(layout.isActive, useSvgIconFilter);
    if (useSvgIconFilter) {
      img.style.filter = filter;
      img.style.webkitFilter = filter;
    } else {
      img.style.removeProperty("filter");
      img.style.removeProperty("-webkit-filter");
    }
  }

  label.style.fontSize = `${layout.labelSize}px`;
  label.style.opacity = String(layout.labelOpacity);

  if (!skipAria) {
    if (layout.isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  }
}

export function CategoriesArc({
  categories,
  onCategoryChange,
}: {
  categories: HomeCategoryItem[];
  onCategoryChange?: (categoryId: string) => void;
}) {
  const initialIndex = Math.max(
    0,
    categories.findIndex((item) => item.id === "all"),
  );
  const length = categories.length;
  const displayIndexRef = useRef(initialIndex);
  const currentCategoryIndexRef = useRef(initialIndex);
  const itemRefs = useRef<(CategoryItemRefs | null)[]>([]);
  const useSvgIconFilterRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isSafari = useIsSafari();
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartDisplayIndexRef = useRef(0);
  const pendingTapIndexRef = useRef<number | null>(null);

  const applyAllLayouts = useCallback(
    (displayIndex: number, options?: { skipFilters?: boolean; skipAria?: boolean }) => {
      const skipFilters = options?.skipFilters ?? isAnimatingRef.current;
      const skipAria = options?.skipAria ?? isAnimatingRef.current;

      categories.forEach((_, index) => {
        const refs = itemRefs.current[index];
        if (!refs) return;

        const layout = computeCategoryLayout(index, displayIndex, length);
        if (layout.isFar) {
          refs.button.style.opacity = "0";
          refs.button.style.pointerEvents = "none";
          return;
        }

        const distance = getWrappedDistanceFloat(index, displayIndex, length);
        refs.button.style.zIndex = String(20 - Math.abs(distance));
        applyCategoryLayout(refs, layout, useSvgIconFilterRef.current, { skipFilters, skipAria });
      });
    },
    [categories, length],
  );

  const animateDisplayIndex = useCallback(
    (targetValue: number, duration: number, onComplete?: () => void) => {
      const from = displayIndexRef.current;
      const delta = targetValue - from;

      if (Math.abs(delta) < 0.001) {
        onComplete?.();
        return;
      }

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      isAnimatingRef.current = true;
      itemRefs.current.forEach((refs) => {
        if (refs) {
          refs.button.style.willChange = "transform, opacity";
          refs.iconWrap.style.willChange = "transform";
        }
      });

      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const current = from + delta * eased;

        displayIndexRef.current = current;
        applyAllLayouts(current, { skipFilters: true, skipAria: true });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
          return;
        }

        displayIndexRef.current = targetValue;
        isAnimatingRef.current = false;
        itemRefs.current.forEach((refs) => {
          if (refs) {
            refs.button.style.willChange = "auto";
            refs.iconWrap.style.willChange = "auto";
          }
        });
        applyAllLayouts(targetValue);
        animationRef.current = null;
        onComplete?.();
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [applyAllLayouts],
  );

  const notifyCategorySettled = useCallback(
    (settled: number) => {
      if (length === 0) return;
      currentCategoryIndexRef.current = settled;
      displayIndexRef.current = settled;
      onCategoryChange?.(categories[settled].id);
    },
    [categories, length, onCategoryChange],
  );

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const settled = normalizeIndex(targetIndex, length);
      const from = displayIndexRef.current;
      const delta = getShortestDelta(from, settled, length);

      animateDisplayIndex(from + delta, Math.min(520, 260 + Math.abs(delta) * 70), () => {
        notifyCategorySettled(settled);
      });
    },
    [animateDisplayIndex, length, notifyCategorySettled],
  );

  const settleAfterDrag = useCallback(() => {
    const from = displayIndexRef.current;
    const targetDisplay = Math.round(from);
    const settled = normalizeIndex(targetDisplay, length);
    const delta = targetDisplay - from;

    if (Math.abs(delta) < 0.001) {
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
      return;
    }

    animateDisplayIndex(targetDisplay, Math.min(520, 260 + Math.abs(delta) * 70), () => {
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
    });
  }, [animateDisplayIndex, applyAllLayouts, length, notifyCategorySettled]);

  const blurButtonAfterPointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

  const beginPointerTrack = useCallback((event: PointerEvent<HTMLElement>, tapIndex: number | null) => {
    if (event.button !== 0) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    pendingTapIndexRef.current = tapIndex;
    dragStartXRef.current = event.clientX;
    dragStartDisplayIndexRef.current = displayIndexRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handleTrackedPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - dragStartXRef.current;
      if (Math.abs(deltaX) <= CATEGORY_DRAG_CLICK_THRESHOLD) return;

      hasDraggedRef.current = true;
      pendingTapIndexRef.current = null;
      event.preventDefault();

      const nextDisplayIndex = dragStartDisplayIndexRef.current - deltaX / CATEGORY_DRAG_PIXELS_PER_STEP;
      const rebasedDisplayIndex =
        Math.abs(nextDisplayIndex) > length * 20
          ? rebaseDisplayIndexContinuous(nextDisplayIndex, length)
          : nextDisplayIndex;

      if (rebasedDisplayIndex !== nextDisplayIndex) {
        dragStartDisplayIndexRef.current += rebasedDisplayIndex - nextDisplayIndex;
      }

      displayIndexRef.current = rebasedDisplayIndex;
      applyAllLayouts(rebasedDisplayIndex, { skipFilters: true, skipAria: true });
    },
    [applyAllLayouts, length],
  );

  const endPointerTrack = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      isDraggingRef.current = false;

      if (hasDraggedRef.current) {
        settleAfterDrag();
        pendingTapIndexRef.current = null;
        return;
      }

      if (pendingTapIndexRef.current !== null) {
        goToIndex(pendingTapIndexRef.current);
        pendingTapIndexRef.current = null;
      }
    },
    [goToIndex, settleAfterDrag],
  );

  const handleContainerPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-category-button]")) return;
    beginPointerTrack(event, null);
  };

  useLayoutEffect(() => {
    useSvgIconFilterRef.current = isSafari;
    applyAllLayouts(displayIndexRef.current);
  }, [applyAllLayouts, isSafari]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  if (length === 0) return null;

  return (
    <div
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleTrackedPointerMove}
      onPointerUp={endPointerTrack}
      onPointerCancel={endPointerTrack}
      className="categories-arc absolute left-[288px] z-10 h-[188px] w-[1440px] cursor-grab select-none active:cursor-grabbing"
      style={{ top: `${ARC_CONTAINER_TOP}px` }}
    >
      <svg
        aria-hidden
        viewBox={`0 0 1440 ${ARC_CONTAINER_HEIGHT}`}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        style={
          isSafari
            ? {
                filter: "blur(44px)",
                WebkitFilter: "blur(44px)",
              }
            : undefined
        }
      >
        <defs>
          {!isSafari && (
            <>
              <filter
                id="categories-arc-glow-soft"
                x="-65%"
                y="-170%"
                width="230%"
                height="440%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="72" edgeMode="none" />
              </filter>
              <filter
                id="categories-arc-glow-core"
                x="-55%"
                y="-145%"
                width="210%"
                height="390%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="42" edgeMode="none" />
              </filter>
              <filter
                id="category-icon-shadow-active"
                x="-120%"
                y="-120%"
                width="340%"
                height="340%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgb(200, 255, 0)" floodOpacity="0.35" />
              </filter>
              <filter
                id="category-icon-shadow-inactive"
                x="-120%"
                y="-120%"
                width="340%"
                height="340%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="rgb(0, 0, 0)" floodOpacity="0.35" />
              </filter>
            </>
          )}
          <linearGradient
            id="categories-arc-glow-gradient"
            x1={ARC_CENTER_X - ARC_GLOW_HORIZONTAL_RADIUS}
            y1="0"
            x2={ARC_CENTER_X + ARC_GLOW_HORIZONTAL_RADIUS}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C8FF00" stopOpacity="0" />
            <stop offset="16%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#C8FF00" stopOpacity="0.46" />
            <stop offset="84%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          className="categories-arc-glow"
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="156"
          strokeLinecap="round"
          opacity="0.2"
          filter={isSafari ? undefined : "url(#categories-arc-glow-soft)"}
        />
        <path
          className="categories-arc-glow"
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="88"
          strokeLinecap="round"
          opacity="0.34"
          filter={isSafari ? undefined : "url(#categories-arc-glow-core)"}
        />
      </svg>

      {isSafari && (
        <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
          <defs>
            <filter
              id="category-icon-shadow-active"
              x="-120%"
              y="-120%"
              width="340%"
              height="340%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgb(200, 255, 0)" floodOpacity="0.35" />
            </filter>
            <filter
              id="category-icon-shadow-inactive"
              x="-120%"
              y="-120%"
              width="340%"
              height="340%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="rgb(0, 0, 0)" floodOpacity="0.35" />
            </filter>
          </defs>
        </svg>
      )}

      {categories.map((item, index) => {
        const layout = computeCategoryLayout(index, initialIndex, length);
        const distance = getWrappedDistanceFloat(index, initialIndex, length);

        return (
          <button
            key={item.id}
            ref={(element) => {
              if (!element) {
                itemRefs.current[index] = null;
                return;
              }

              const iconWrap = element.querySelector<HTMLElement>("[data-category-icon-wrap]");
              const img = element.querySelector<HTMLImageElement>("[data-category-icon]");
              const label = element.querySelector<HTMLElement>("[data-category-label]");
              if (!iconWrap || !img || !label) return;

              itemRefs.current[index] = { button: element, iconWrap, img, label };
            }}
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
              beginPointerTrack(event, index);
            }}
            onPointerMove={handleTrackedPointerMove}
            onPointerUp={(event) => {
              endPointerTrack(event);
              blurButtonAfterPointer(event);
            }}
            onPointerCancel={(event) => {
              endPointerTrack(event);
              blurButtonAfterPointer(event);
            }}
            aria-label={item.label}
            aria-current={layout.isActive ? "true" : undefined}
            data-category-button
            className="group absolute flex flex-col items-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none"
            style={{
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              transform: "translateX(-50%)",
              opacity: layout.opacity,
              zIndex: 20 - Math.abs(distance),
              pointerEvents: layout.isFar ? "none" : "auto",
              WebkitAppearance: "none",
              appearance: "none",
            }}
          >
            <span
              data-category-icon-wrap
              className="inline-block origin-top"
              style={{ transform: `scale(${layout.scale})` }}
            >
              <img
                data-category-icon
                src={item.iconUrl || CATEGORY_ICON_FALLBACK_BY_ID[item.id] || "about:blank"}
                alt=""
                draggable={false}
                className={`pointer-events-none object-contain group-hover:brightness-110 ${
                  layout.isActive
                    ? "drop-shadow-[0_10px_24px_rgba(200,255,0,0.35)]"
                    : "drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                }`}
                style={{
                  height: `${layout.iconSize}px`,
                  width: `${layout.iconSize}px`,
                }}
              />
            </span>
            <span
              data-category-label
              className="mt-[8px] text-center font-semibold tracking-[-0.002em] text-white"
              style={{ fontSize: `${layout.labelSize}px`, opacity: layout.labelOpacity }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
