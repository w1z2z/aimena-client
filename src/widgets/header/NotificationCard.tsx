import Link from "next/link";

type NotificationCardProps = {
  title: string;
  subtitle?: string;
  tags?: string[];
  time: string;
  href?: string;
  imageUrl?: string | null;
};

function NotificationAvatar({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <div className="relative h-[49px] w-[49px] shrink-0">
      <div className="h-full w-full overflow-hidden rounded-[15px] bg-[#D9D9D9]">
        {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-[24px] max-w-full shrink-0 items-center justify-center rounded-[39px] border-[0.5px] border-solid border-[#8E8BED] bg-[#FFFFFF] px-[8px] text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
      <span className="truncate">{label}</span>
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
}: NotificationCardProps) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-[12px]">
        <NotificationAvatar imageUrl={imageUrl} />
        <div className="flex min-w-0 flex-col items-start gap-[12px]">
          <p className="w-full text-[14px] font-semibold leading-[130%] tracking-[0.001em] text-[#1A1A1A]">
            {title}
          </p>
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap items-start gap-[12px]">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          ) : null}
          {subtitle ? (
            <p className="w-full text-[14px] font-normal leading-[170%] text-[#1A1A1A]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 self-end text-[11px] font-semibold leading-[16px] tracking-[0.002em] text-[#1A1A1A]">
        {time}
      </span>
    </>
  );

  const className =
    "flex w-full items-end justify-between gap-[8px] text-left transition hover:opacity-90";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
