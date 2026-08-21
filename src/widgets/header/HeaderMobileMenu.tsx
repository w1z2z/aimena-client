"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { getCategories, type ApiCategoryNode } from "@/shared/api/catalog";
import { requestOpenHomeFilters } from "@/shared/lib/home-open-filters";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

import { ButtonPrimary } from "./ButtonPrimary";

const PANEL_CLOSE_MS = 260;

type HeaderMobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onCreateListing: () => void;
};

export function HeaderMobileMenu({ open, onClose, onCreateListing }: HeaderMobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const titleId = useId();
  const scrollRegionRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);

  useScrollLock(isRendered, scrollRegionRef);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "tree", "item", "header"],
    queryFn: () => getCategories({ parentsOnly: false, homeArc: false, forType: "item" }),
    staleTime: 5 * 60_000,
    enabled: open || isRendered,
  });

  const parents = (categoriesQuery.data?.data ?? []) as ApiCategoryNode[];

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      const frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsVisible(true));
      });
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
      setExpandedParentId(null);
    }, PANEL_CLOSE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onClose]);

  const selectCategory = (parentId: string, childId?: string) => {
    onClose();
    requestOpenHomeFilters({
      categoryParentId: parentId,
      categoryChildId: childId,
      searchMode: "want",
    });
    if (!isHomePage) {
      router.push("/#home-recommendations", { scroll: false });
    }
  };

  const handleCreateListing = () => {
    onClose();
    onCreateListing();
  };

  if (!portalReady || !isRendered) return null;

  return createPortal(
    <div
      className={`site-header-mobile-menu ${isVisible ? "is-open" : ""}`}
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        className="site-header-mobile-menu__backdrop"
        aria-label="Закрыть меню"
        tabIndex={isVisible ? 0 : -1}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="site-header-mobile-menu__panel"
      >
        <div className="site-header-mobile-menu__head">
          <h2 id={titleId} className="site-header-mobile-menu__title">
            Меню
          </h2>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="site-header-mobile-menu__close"
            onClick={onClose}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="site-header-mobile-menu__cta">
          <ButtonPrimary className="w-full" onClick={handleCreateListing}>
            Разместить объявление
          </ButtonPrimary>
        </div>

        <p className="site-header-mobile-menu__section-title">Категории</p>

        <div ref={scrollRegionRef} className="site-header-mobile-menu__body">
          {categoriesQuery.isLoading ? (
            <p className="site-header-mobile-menu__status">Загрузка...</p>
          ) : parents.length === 0 ? (
            <p className="site-header-mobile-menu__status">Категории не найдены</p>
          ) : (
            <ul className="site-header-mobile-menu__list">
              {parents.map((parent) => {
                const children = parent.children ?? [];
                const hasChildren = children.length > 0;
                const isExpanded = expandedParentId === parent.id;

                return (
                  <li key={parent.id} className="site-header-mobile-menu__item">
                    <div className="site-header-mobile-menu__parent-row">
                      <button
                        type="button"
                        className="site-header-mobile-menu__parent"
                        onClick={() => selectCategory(parent.id)}
                      >
                        {parent.name}
                      </button>
                      {hasChildren ? (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? `Скрыть подкатегории: ${parent.name}`
                              : `Показать подкатегории: ${parent.name}`
                          }
                          className={`site-header-mobile-menu__chevron${isExpanded ? " is-open" : ""}`}
                          onClick={() =>
                            setExpandedParentId((current) =>
                              current === parent.id ? null : parent.id,
                            )
                          }
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                            <path
                              d="M1 1L5 5L9 1"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>

                    {hasChildren && isExpanded ? (
                      <ul className="site-header-mobile-menu__children">
                        {children.map((child) => (
                          <li key={child.id}>
                            <button
                              type="button"
                              className="site-header-mobile-menu__child"
                              onClick={() => selectCategory(parent.id, child.id)}
                            >
                              {child.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
