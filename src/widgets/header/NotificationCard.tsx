import Link from "next/link";

export const NOTIFICATION_CARD_HEIGHT = 74;
export const NOTIFICATION_CARD_GAP = 10;

type NotificationCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  time: string;
  href?: string;
};

const cardClassName =
  "relative box-border flex h-[74px] w-full shrink-0 gap-[10px] overflow-hidden rounded-[8px] border border-black border-[0.5px] bg-white px-[10px]";

function NotificationAvatar() {
  return <div className="h-[46px] w-[46px] shrink-0 self-center rounded-full bg-[#1A1A1A]" aria-hidden="true" />;
}

function NotificationTitle({ title }: { title: string }) {
  const match = title.match(/^(\p{Extended_Pictographic}+)\s{1,2}(.*)$/u);
  if (!match) {
    return <>{title}</>;
  }

  const [, emoji, text] = match;

  return (
    <>
      <span className="inline-block text-[11px] leading-none">{emoji}</span>
      {text ? <span>{`  ${text}`}</span> : null}
    </>
  );
}

export function NotificationCard({ title, subtitle, badge, time, href }: NotificationCardProps) {
  const content = (
    <>
      <NotificationAvatar />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[7px] py-[11px]">
        <p className="pr-[2px] font-[family-name:var(--font-golos)] text-[14px] leading-[1.1] text-[#1A1A1A]">
          <NotificationTitle title={title} />
        </p>
        {subtitle || badge ? (
          <div className="flex min-w-0 items-center gap-[8px] pr-[38px]">
            {subtitle ? (
              <span className="shrink-0 font-[family-name:var(--font-golos)] text-[14px] leading-none text-[#1A1A1A]">
                {subtitle}
              </span>
            ) : null}
            {badge ? (
              <span className="inline-flex min-w-0 max-w-full shrink items-center rounded-[9px] bg-[#1A1A1A] px-[11px] py-[4px] font-[family-name:var(--font-golos)] text-[12px] leading-none text-white">
                <span className="truncate">{badge}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <span className="absolute bottom-[10px] right-[10px] font-[family-name:var(--font-golos)] text-[10px] leading-none text-[#5D5D5D]">
        {time}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${cardClassName} transition hover:bg-[#FAFAFA]`}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
