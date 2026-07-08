import { ExchangeBadgeIcon } from "@/shared/ui/icons";

export function CenterExchangeBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Открыть полный список объявлений по выбранной категории и параметрам"
      className="home-exchange-badge absolute bottom-[20.19%] left-[46.3%] right-[37.82%] top-[49.35%] cursor-pointer rounded-full border-0 bg-transparent p-0 transition-shadow duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.36)]"
    >
      <div className="home-exchange-badge__glass glass-surface relative h-full w-full overflow-hidden rounded-full">
        <svg viewBox="0 0 163 163" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <ellipse cx="81.5" cy="81" rx="71" ry="71" fill="none" stroke="#CACACA" strokeWidth="2.5" />
        </svg>
        <div className="pointer-events-none absolute left-[53px] top-[31px] h-[48.45px] w-[58.45px]">
          <ExchangeBadgeIcon className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-[55.64%_19.02%_24.73%_20.86%] flex items-center justify-center text-center text-[16px] font-bold leading-[20px] tracking-[0.001em] text-white">
          Все варианты
        </div>
      </div>
    </button>
  );
}
