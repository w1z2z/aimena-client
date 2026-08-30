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
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { categoryPlaceholderIconSrc } from "@/shared/ui/icons";
import { COMPACT_HEADER_QUERY } from "@/widgets/header/constants";

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

const ARC_CONTAINER_WIDTH = 1311;
const ARC_CENTER_X = ARC_CONTAINER_WIDTH / 2;
/** Figma section-category: top 96, left 305, 1311×183 */
const ARC_CONTAINER_TOP = 96;
const CATEGORY_DRAG_CLICK_THRESHOLD = 6;
const CATEGORY_DRAG_PIXELS_PER_STEP = 88;
/** Compact (≤1024): scale icon size on mobile. */
const ARC_COMPACT_SCALE = 0.68;
/** Compact: horizontal spacing between categories (< 1 = tighter). */
const ARC_COMPACT_SPACING_SCALE = 0.88;

type CategoryProfileStep = {
  offsetX: number;
  /** Вертикальный центр иконки на дуге (ровная траектория). */
  centerY: number;
  iconWidth: number;
  iconHeight: number;
  labelSize: number;
  labelLineHeight: number;
  opacity: number;
};

/**
 * Симметричный профиль: индекс — расстояние от центра.
 * centerY задаёт ровную дугу; top иконки = centerY − iconHeight / 2.
 */
const CATEGORY_PROFILE: readonly CategoryProfileStep[] = [
  { offsetX: 0, centerY: 48, iconWidth: 94, iconHeight: 92, labelSize: 14, labelLineHeight: 17, opacity: 1 },
  { offsetX: 137, centerY: 52, iconWidth: 67, iconHeight: 59, labelSize: 14, labelLineHeight: 17, opacity: 1 },
  { offsetX: 268, centerY: 58, iconWidth: 47, iconHeight: 59.5, labelSize: 14, labelLineHeight: 17, opacity: 1 },
  { offsetX: 384, centerY: 70, iconWidth: 48, iconHeight: 45, labelSize: 11.3, labelLineHeight: 16, opacity: 1 },
  { offsetX: 505, centerY: 90, iconWidth: 44, iconHeight: 41, labelSize: 9.2, labelLineHeight: 13, opacity: 0.85 },
  { offsetX: 572, centerY: 118, iconWidth: 28, iconHeight: 28, labelSize: 7.3, labelLineHeight: 10, opacity: 0.72 },
  { offsetX: 528, centerY: 150, iconWidth: 16, iconHeight: 16, labelSize: 3.6, labelLineHeight: 5, opacity: 0.6 },
] as const;

const CATEGORY_ICON_ACTIVE_SHADOW =
  "drop-shadow(0 4px 16px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 36px rgba(217, 217, 217, 0.55)) drop-shadow(0 0 64px rgba(217, 217, 217, 0.35))";
const CATEGORY_ICON_INACTIVE_SHADOW = "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35))";
const CATEGORY_ICON_PLACEHOLDER = categoryPlaceholderIconSrc;

function interpolateProfile(
  property: keyof Omit<CategoryProfileStep, "opacity"> | "opacity",
  distance: number,
) {
  const bounded = Math.min(Math.abs(distance), CATEGORY_PROFILE.length - 1);
  const lowerIndex = Math.floor(bounded);
  const upperIndex = Math.min(lowerIndex + 1, CATEGORY_PROFILE.length - 1);
  const progress = bounded - lowerIndex;
  const lowerValue = CATEGORY_PROFILE[lowerIndex][property];
  const upperValue = CATEGORY_PROFILE[upperIndex][property];
  return lowerValue + (upperValue - lowerValue) * progress;
}

/** Open arc through icon centers — same trajectory as category icons (not a full ellipse). */
const CATEGORY_ARC_PATH = (() => {
  const points: Array<{ x: number; y: number }> = [];
  const from = -(CATEGORY_PROFILE.length - 1);
  const to = CATEGORY_PROFILE.length - 1;
  const step = 0.08;

  for (let distance = from; distance <= to + 1e-9; distance += step) {
    const abs = Math.abs(distance);
    const sign = distance < 0 ? -1 : 1;
    points.push({
      x: ARC_CENTER_X + (abs < 1e-9 ? 0 : sign * interpolateProfile("offsetX", abs)),
      y: interpolateProfile("centerY", abs),
    });
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
})();

/** Glow continues past the icons so the lit band reads longer and fuller. */
const CATEGORY_GLOW_ARC_EXTEND = 1.2;
const CATEGORY_GLOW_ARC_PATH = (() => {
  const last = CATEGORY_PROFILE.length - 1;
  const prev = Math.max(0, last - 1);
  const offsetDelta =
    CATEGORY_PROFILE[last].offsetX - CATEGORY_PROFILE[prev].offsetX;
  const centerYDelta =
    CATEGORY_PROFILE[last].centerY - CATEGORY_PROFILE[prev].centerY;

  const sample = (distance: number) => {
    const abs = Math.abs(distance);
    const sign = distance < 0 ? -1 : 1;
    if (abs <= last + 1e-9) {
      return {
        x: ARC_CENTER_X + (abs < 1e-9 ? 0 : sign * interpolateProfile("offsetX", abs)),
        y: interpolateProfile("centerY", abs),
      };
    }
    const overshoot = abs - last;
    return {
      x:
        ARC_CENTER_X +
        sign * (CATEGORY_PROFILE[last].offsetX + offsetDelta * overshoot),
      y: CATEGORY_PROFILE[last].centerY + centerYDelta * overshoot,
    };
  };

  const points: Array<{ x: number; y: number }> = [];
  const from = -(last + CATEGORY_GLOW_ARC_EXTEND);
  const to = last + CATEGORY_GLOW_ARC_EXTEND;
  const step = 0.08;

  for (let distance = from; distance <= to + 1e-9; distance += step) {
    points.push(sample(distance));
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
})();

const CATEGORY_ARC_BACKDROP_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ARC_CONTAINER_WIDTH} 183" fill="none"><path d="${CATEGORY_GLOW_ARC_PATH}" stroke="white" stroke-width="320" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
)}")`;

function CategoryArcGlass() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      style={{ transform: "translateZ(0)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitBackdropFilter: "blur(96px)",
          backdropFilter: "blur(96px)",
          WebkitMaskImage: CATEGORY_ARC_BACKDROP_MASK,
          maskImage: CATEGORY_ARC_BACKDROP_MASK,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

      <svg
        className="absolute inset-0 overflow-visible"
        width={ARC_CONTAINER_WIDTH}
        height={183}
        viewBox={`0 0 ${ARC_CONTAINER_WIDTH} 183`}
        fill="none"
      >
        <defs>
          <filter
            id="category-arc-wide-glow"
            x="-80%"
            y="-260%"
            width="260%"
            height="620%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="96" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.26 0"
            />
          </filter>
          <filter
            id="category-arc-rim-blur"
            x="-55%"
            y="-200%"
            width="210%"
            height="500%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" />
          </filter>
        </defs>

        <path
          d={CATEGORY_GLOW_ARC_PATH}
          stroke="#cacaca"
          strokeWidth={360}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.11}
          filter="url(#category-arc-wide-glow)"
        />

        <path
          d={CATEGORY_GLOW_ARC_PATH}
          stroke="#cacaca"
          strokeWidth={72}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.2}
          filter="url(#category-arc-rim-blur)"
        />
      </svg>
    </div>
  );
}

function getCategoryIconFilter(isActive: boolean, useSvgFilter: boolean) {
  if (useSvgFilter) {
    return isActive ? "url(#category-icon-shadow-active)" : "url(#category-icon-shadow-inactive)";
  }

  return isActive ? CATEGORY_ICON_ACTIVE_SHADOW : CATEGORY_ICON_INACTIVE_SHADOW;
}

type CategoryLayout = {
  x: number;
  y: number;
  iconWidth: number;
  iconHeight: number;
  opacity: number;
  isFar: boolean;
  isActive: boolean;
  labelSize: number;
  labelLineHeight: number;
  labelOpacity: number;
};

function computeCategoryLayout(
  index: number,
  displayIndex: number,
  length: number,
  offsetXScale = 1,
): CategoryLayout {
  const distance = getWrappedDistanceFloat(index, displayIndex, length);
  const maxVisibleDistance = CATEGORY_PROFILE.length - 1;
  const isFar = Math.abs(distance) > maxVisibleDistance + 0.05;
  const direction = Math.sign(distance);
  const iconHeight = interpolateProfile("iconHeight", distance);
  const centerY = interpolateProfile("centerY", distance);

  return {
    x: ARC_CENTER_X + direction * interpolateProfile("offsetX", distance) * offsetXScale,
    y: centerY - iconHeight / 2,
    iconWidth: interpolateProfile("iconWidth", distance),
    iconHeight,
    opacity: isFar ? 0 : interpolateProfile("opacity", distance),
    isFar,
    isActive: Math.abs(distance) < 0.05,
    labelSize: interpolateProfile("labelSize", distance),
    labelLineHeight: interpolateProfile("labelLineHeight", distance),
    labelOpacity: isFar ? 0 : interpolateProfile("opacity", distance),
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
  const { button, img, label } = refs;
  const skipFilters = options?.skipFilters ?? false;
  const skipAria = options?.skipAria ?? false;

  button.style.transform = `translate3d(${layout.x}px, ${layout.y}px, 0) translateX(-50%)`;
  button.style.opacity = String(layout.opacity);
  button.style.pointerEvents = layout.isFar ? "none" : "auto";

  img.style.width = `${layout.iconWidth}px`;
  img.style.height = `${layout.iconHeight}px`;

  if (skipFilters) {
    img.style.filter = "none";
    img.style.webkitFilter = "none";
  } else {
    const filter = getCategoryIconFilter(layout.isActive, useSvgIconFilter);
    img.style.filter = filter;
    img.style.webkitFilter = filter;
  }

  label.style.fontSize = `${layout.labelSize}px`;
  label.style.lineHeight = `${layout.labelLineHeight}px`;
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
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
  const arcScale = isCompact ? ARC_COMPACT_SCALE : 1;
  const offsetXScale = isCompact ? ARC_COMPACT_SPACING_SCALE : 1;
  const dragPixelsPerStep = CATEGORY_DRAG_PIXELS_PER_STEP * arcScale * offsetXScale;
  const animationRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
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

        const layout = computeCategoryLayout(index, displayIndex, length, offsetXScale);
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
    [categories, length, offsetXScale],
  );

  const setInteractionWillChange = useCallback((enabled: boolean) => {
    itemRefs.current.forEach((refs) => {
      if (!refs) return;
      refs.button.style.willChange = enabled ? "transform, opacity" : "auto";
    });
  }, []);

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
      setInteractionWillChange(true);

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
        setInteractionWillChange(false);
        applyAllLayouts(targetValue);
        animationRef.current = null;
        onComplete?.();
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [applyAllLayouts, setInteractionWillChange],
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
      setInteractionWillChange(false);
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
      return;
    }

    animateDisplayIndex(targetDisplay, Math.min(520, 260 + Math.abs(delta) * 70), () => {
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
    });
  }, [animateDisplayIndex, applyAllLayouts, length, notifyCategorySettled, setInteractionWillChange]);

  const blurButtonAfterPointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

  const beginPointerTrack = useCallback(
    (event: PointerEvent<HTMLElement>, tapIndex: number | null) => {
      if (event.button !== 0) return;

      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      pendingTapIndexRef.current = tapIndex;
      dragStartXRef.current = event.clientX;
      dragStartDisplayIndexRef.current = displayIndexRef.current;
      setInteractionWillChange(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [setInteractionWillChange],
  );

  const handleTrackedPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - dragStartXRef.current;
      if (Math.abs(deltaX) <= CATEGORY_DRAG_CLICK_THRESHOLD) return;

      hasDraggedRef.current = true;
      pendingTapIndexRef.current = null;
      event.preventDefault();

      const nextDisplayIndex = dragStartDisplayIndexRef.current - deltaX / dragPixelsPerStep;
      const rebasedDisplayIndex =
        Math.abs(nextDisplayIndex) > length * 20
          ? rebaseDisplayIndexContinuous(nextDisplayIndex, length)
          : nextDisplayIndex;

      if (rebasedDisplayIndex !== nextDisplayIndex) {
        dragStartDisplayIndexRef.current += rebasedDisplayIndex - nextDisplayIndex;
      }

      displayIndexRef.current = rebasedDisplayIndex;

      if (dragFrameRef.current !== null) return;

      dragFrameRef.current = requestAnimationFrame(() => {
        dragFrameRef.current = null;
        applyAllLayouts(displayIndexRef.current, { skipFilters: true, skipAria: true });
      });
    },
    [applyAllLayouts, dragPixelsPerStep, length],
  );

  const endPointerTrack = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      isDraggingRef.current = false;

      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
        applyAllLayouts(displayIndexRef.current, { skipFilters: true, skipAria: true });
      }

      if (hasDraggedRef.current) {
        settleAfterDrag();
        pendingTapIndexRef.current = null;
        return;
      }

      setInteractionWillChange(false);

      if (pendingTapIndexRef.current !== null) {
        goToIndex(pendingTapIndexRef.current);
        pendingTapIndexRef.current = null;
      }
    },
    [applyAllLayouts, goToIndex, setInteractionWillChange, settleAfterDrag],
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
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
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
      className={`categories-arc absolute left-[305px] z-10 h-[183px] w-[1311px] cursor-grab overflow-visible select-none active:cursor-grabbing${isCompact ? " categories-arc--compact" : ""}`}
      style={{
        top: `${ARC_CONTAINER_TOP}px`,
        touchAction: "none",
        ...(isCompact
          ? {
              transform: `scale(${ARC_COMPACT_SCALE})`,
              transformOrigin: "top center",
            }
          : null),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        style={
          isCompact
            ? {
                transform: `scaleX(${ARC_COMPACT_SPACING_SCALE})`,
                transformOrigin: `${ARC_CENTER_X}px top`,
              }
            : undefined
        }
      >
        <CategoryArcGlass />
      </div>

      <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
        <defs>
          <filter
            id="category-icon-shadow-active"
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              in="SourceGraphic"
              dx="0"
              dy="0"
              stdDeviation="28"
              floodColor="rgb(230, 230, 230)"
              floodOpacity="0.6"
            />
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

      <div className="absolute inset-0 z-[1] overflow-visible" style={{ transform: "translateZ(0)" }}>
        {categories.map((item, index) => {
          const layout = computeCategoryLayout(index, initialIndex, length, offsetXScale);
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
              className="group absolute left-0 top-0 flex flex-col items-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none"
              style={{
                transform: `translate3d(${layout.x}px, ${layout.y}px, 0) translateX(-50%)`,
                opacity: layout.opacity,
                zIndex: 20 - Math.abs(distance),
                pointerEvents: layout.isFar ? "none" : "auto",
                WebkitAppearance: "none",
                appearance: "none",
              }}
            >
              <span data-category-icon-wrap className="inline-block">
                <img
                  data-category-icon
                  src={item.iconUrl || CATEGORY_ICON_PLACEHOLDER}
                  alt=""
                  draggable={false}
                  className="pointer-events-none object-contain group-hover:brightness-110"
                  style={{
                    width: `${layout.iconWidth}px`,
                    height: `${layout.iconHeight}px`,
                    filter: layout.isActive ? CATEGORY_ICON_ACTIVE_SHADOW : CATEGORY_ICON_INACTIVE_SHADOW,
                  }}
                />
              </span>
              <span
                data-category-label
                className="mt-[8px] text-center font-semibold tracking-[-0.002em] text-white"
                style={{
                  fontSize: `${layout.labelSize}px`,
                  lineHeight: `${layout.labelLineHeight}px`,
                  opacity: layout.labelOpacity,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
