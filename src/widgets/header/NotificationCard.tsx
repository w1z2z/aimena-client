"use client";

import Link from "next/link";

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
          isSupport ? "bg-[#1A1A1A] text-[22px] leading-none" : "bg-[#D9D9D9]",
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
    <span className="box-border inline-flex h-[24px] max-w-full shrink-0 items-center justify-center gap-[16px] rounded-[39px] border-[0.5px] border-solid border-[#8E8BED] bg-[#FFFFFF] px-[8px] text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
      <span className="max-w-[120px] truncate text-center">{label}</span>
    </span>
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
          {tags && tags.length > 0 ? (
            <div className="mt-[6px] flex flex-wrap items-start gap-[12px]">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          ) : null}
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
