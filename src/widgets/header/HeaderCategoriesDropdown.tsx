"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCategories, type ApiCategoryNode } from "@/shared/api/catalog";
import { requestOpenHomeFilters } from "@/shared/lib/home-open-filters";

const PANEL_CLOSE_MS = 220;

type HeaderCategoriesDropdownProps = {
  onTriggerWidthChange?: (width: number) => void;
};

export function HeaderCategoriesDropdown({
  onTriggerWidthChange,
}: HeaderCategoriesDropdownProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "tree", "item", "header"],
    queryFn: () => getCategories({ parentsOnly: false, homeArc: false, forType: "item" }),
    staleTime: 5 * 60_000,
    enabled: open || isMounted,
  });

  const parents = (categoriesQuery.data?.data ?? []) as ApiCategoryNode[];
  const hoveredParent = parents.find((item) => item.id === hoveredParentId) ?? null;
  const children = hoveredParent?.children ?? [];

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !onTriggerWidthChange) return;

    const notify = () => {
      onTriggerWidthChange(trigger.getBoundingClientRect().width);
    };

    notify();
    const observer = new ResizeObserver(notify);
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [onTriggerWidthChange]);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    setHoveredParentId(null);
    const timeoutId = window.setTimeout(() => setIsMounted(false), PANEL_CLOSE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectCategory = (parentId: string, childId?: string) => {
    setOpen(false);
    requestOpenHomeFilters({
      categoryParentId: parentId,
      categoryChildId: childId,
      searchMode: "want",
    });
    if (!isHomePage) {
      router.push("/#home-recommendations", { scroll: false });
    }
  };

  return (
    <div ref={containerRef} className="absolute left-[177px] top-[11px] z-[60]">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[32px] cursor-pointer items-center justify-center gap-[8px] rounded-[36px] border border-solid px-[24px] py-[8px] text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] transition-colors ${
          open
            ? "border-[#8E8BED] bg-[#f0e8ff]"
            : "border-[#CACACA] bg-white hover:bg-[#f8f8f5]"
        }`}
      >
        Все категории
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Категории"
          aria-hidden={!isVisible}
          className={`header-categories-menu ${isVisible ? "is-open" : ""}`}
          onMouseLeave={() => setHoveredParentId(null)}
        >
          <div className="header-categories-menu__parents" role="list">
            {categoriesQuery.isLoading ? (
              <p className="header-categories-menu__status">Загрузка...</p>
            ) : parents.length === 0 ? (
              <p className="header-categories-menu__status">Категории не найдены</p>
            ) : (
              parents.map((parent) => {
                const hasChildren = (parent.children?.length ?? 0) > 0;
                const isActive = hoveredParentId === parent.id;
                return (
                  <button
                    key={parent.id}
                    type="button"
                    role="listitem"
                    className={`header-categories-menu__parent cursor-pointer${isActive ? " is-active" : ""}`}
                    onMouseEnter={() => setHoveredParentId(parent.id)}
                    onFocus={() => setHoveredParentId(parent.id)}
                    onClick={() => selectCategory(parent.id)}
                  >
                    <span>{parent.name}</span>
                    {hasChildren ? (
                      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
                        <path
                          d="M1 1L5 5L1 9"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {hoveredParent && children.length > 0 ? (
            <div className="header-categories-menu__children" role="list">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  role="listitem"
                  className="header-categories-menu__child cursor-pointer"
                  onClick={() => selectCategory(hoveredParent.id, child.id)}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
