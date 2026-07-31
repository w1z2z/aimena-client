"use client";

export function PublicProfileDealsPanel() {
  return (
    <section className="flex w-full flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="pr-14 text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          История обменов
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">0 обменов</p>
      </div>

      <div className="mt-12">
        <p className="text-[16px] font-semibold text-[#626262]">
          Пока нет обменов.
        </p>
      </div>
    </section>
  );
}
