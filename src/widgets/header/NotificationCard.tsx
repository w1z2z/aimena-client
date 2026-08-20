"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

type NotificationCardProps = {
  title: string;
  subtitle?: string;
  tags?: string[];
  time: string;
  href?: string;
  imageUrl?: string | null;
  avatarFallback?: string | null;
  isSupport?: boolean;
  hasUnread?: boolean;
  onNavigate?: () => void;
};

const TAG_GAP = 12;
const MORE_RESERVE = 28;

function NotificationAvatar({
  imageUrl,
  avatarFallback,
  isSupport = false,
  hasUnread = false,
}: {
  imageUrl?: string | null;
  avatarFallback?: string | null;
  isSupport?: boolean;
  hasUnread?: boolean;
}) {
  const fallback = avatarFallback ?? "?";

  return (
    <div className="relative size-[49px] shrink-0">
      <div
        className={[
          "flex size-full items-center justify-center overflow-hidden rounded-[15px] text-[14px] font-extrabold text-[#1A1A1A]",
          isSupport ? "bg-[#1A1A1A] text-[22px] leading-none" : "bg-[#cacaca]",
        ].join(" ")}
      >
        {imageUrl && !isSupport ? (
          // Storage URL is dynamic and configured by the API.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{isSupport ? "❤️" : fallback}</span>
        )}
      </div>
      {hasUnread ? <span aria-hidden className="unread-dot unread-dot--avatar" /> : null}
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="box-border inline-flex h-[24px] max-w-[120px] shrink-0 items-center justify-center rounded-[39px] border-[0.5px] border-solid border-[#8E8BED] bg-[#FFFFFF] px-[8px] text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
      <span className="truncate text-center">{label}</span>
    </span>
  );
}

function NotificationTags({ tags }: { tags: string[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const syncVisibleCount = () => {
      const row = rowRef.current;
      const measure = measureRef.current;
      if (!row || !measure) return;

      const availableWidth = row.clientWidth;
      if (availableWidth <= 0) return;

      const measurePills = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-notification-tag-measure]"),
      );
      if (measurePills.length === 0) {
        setVisibleCount(0);
        return;
      }

      let nextCount = 0;
      let usedWidth = 0;

      for (let index = 0; index < measurePills.length; index += 1) {
        const pillWidth = measurePills[index]?.offsetWidth ?? 0;
        const nextWidth = index === 0 ? pillWidth : usedWidth + TAG_GAP + pillWidth;
        const remaining = measurePills.length - (index + 1);
        const widthBudget = remaining > 0 ? availableWidth - MORE_RESERVE : availableWidth;
        if (nextWidth > widthBudget) break;
        usedWidth = nextWidth;
        nextCount = index + 1;
      }

      setVisibleCount(nextCount > 0 ? nextCount : tags.length > 0 ? 1 : 0);
    };

    syncVisibleCount();
    const frameId = window.requestAnimationFrame(syncVisibleCount);
    const row = rowRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && row
        ? new ResizeObserver(() => syncVisibleCount())
        : null;
    if (row && observer) observer.observe(row);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [tags]);

  const visibleTags = tags.slice(0, visibleCount);
  const moreCount = Math.max(tags.length - visibleCount, 0);

  return (
    <div ref={rowRef} className="relative mt-[6px] flex w-full min-w-0 items-center gap-[12px]">
      <div className="flex min-w-0 items-center gap-[12px] overflow-hidden">
        {visibleTags.map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
      </div>
      {moreCount > 0 ? (
        <span className="shrink-0 text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
          +{moreCount}
        </span>
      ) : null}
      <div
        ref={measureRef}
        className="pointer-events-none absolute left-0 top-0 z-[-1] flex gap-[12px]"
        aria-hidden
        style={{ visibility: "hidden" }}
      >
        {tags.map((tag) => (
          <span key={tag} data-notification-tag-measure>
            <TagPill label={tag} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function NotificationCard({
  title,
  subtitle,
  tags,
  time,
  href,
  imageUrl,
  avatarFallback,
  isSupport = false,
  hasUnread = false,
  onNavigate,
}: NotificationCardProps) {
  const content = (
    <>
      <div className="flex w-[312px] shrink-0 items-start gap-[12px]">
        <NotificationAvatar
          imageUrl={imageUrl}
          avatarFallback={avatarFallback}
          isSupport={isSupport}
          hasUnread={hasUnread}
        />
        <div className="flex w-[251px] min-w-0 flex-col items-start">
          <p className="m-0 w-full text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A]">
            {title}
          </p>
          {tags && tags.length > 0 ? <NotificationTags tags={tags} /> : null}
          {subtitle ? (
            <p className="m-0 mt-[6px] w-full text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 self-end whitespace-nowrap text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
        {time}
      </span>
    </>
  );

  const className =
    "flex w-[364px] shrink-0 items-end justify-between text-left transition hover:opacity-90";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          onNavigate?.();
        }}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
