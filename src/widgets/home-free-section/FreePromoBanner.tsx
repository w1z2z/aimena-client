import { FreePromoStarIcon } from "@/shared/ui/icons";

import { PROMO_WIDTH } from "./constants";

export function FreePromoBanner() {
  return (
    <div
      className="relative flex shrink-0 flex-col overflow-clip rounded-[10px] bg-white p-[48px]"
      style={{ width: `${PROMO_WIDTH}px` }}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-[24px]">
          <h3 className="h-[31px] text-[40px] font-bold leading-[40px] tracking-[-0.2px] text-brand">
            Всё даром
          </h3>
          <p className="max-w-[560px] text-[18px] font-semibold leading-[1.2] tracking-[-0.036px] text-text-secondary">
            Люди отдают всё что угодно. Просто так.
          </p>
        </div>
        <button
          type="button"
          className="box-border flex h-[48px] w-[225px] shrink-0 items-center justify-center gap-[6px] rounded-[10px] border border-accent border-[0.5px] bg-accent px-[24px] py-[16px] transition hover:brightness-105 active:translate-y-[0.5px]"
        >
          <span className="flex h-[16px] w-[177px] items-center justify-center text-center text-[16px] font-bold leading-[20px] tracking-[0.001em] text-surface">
            Посмотреть
          </span>
        </button>
      </div>
      <div className="pointer-events-none absolute -right-[6%] -top-[10%] z-[1] aspect-square w-[95%] overflow-hidden rounded-[49px]">
        <FreePromoStarIcon className="block h-full w-full max-w-none" />
      </div>
    </div>
  );
}
