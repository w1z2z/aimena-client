import { PROMO_HEIGHT, PROMO_WIDTH } from "./constants";

export function FreePromoBanner() {
  return (
    <div
      className="relative isolate flex shrink-0 flex-col items-start justify-between overflow-hidden rounded-[31px] bg-white p-[48px]"
      style={{
        width: `${PROMO_WIDTH}px`,
        height: `${PROMO_HEIGHT}px`,
      }}
    >
      <div className="relative z-0 flex w-full max-w-[560px] flex-col items-start gap-[24px]">
        <h3 className="flex h-[31px] items-center text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A]">
          Всё даром
        </h3>
        <p className="flex w-full items-center text-[14px] font-normal leading-[170%] text-[#3D3D3D]">
          Люди отдают всё что угодно. Просто так.
        </p>
      </div>

      <button
        type="button"
        className="relative z-[1] box-border flex h-[48px] w-[225px] shrink-0 items-center justify-center gap-[6px] rounded-[16px] border-[0.5px] border-solid border-[#CACACA] bg-[#8E8BED] px-[24px] py-[16px] transition hover:brightness-105 active:translate-y-[0.5px]"
      >
        <span className="flex h-[16px] w-[177px] items-center justify-center text-center text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#F8F8F5]">
          Посмотреть
        </span>
      </button>

      <img
        src="/free-promo-star.png"
        alt=""
        width={304}
        height={393}
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 z-[2] h-[393px] w-[304px] max-w-none"
      />
    </div>
  );
}
