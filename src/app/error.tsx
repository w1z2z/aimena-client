"use client";

import Link from "next/link";

import { Header } from "@/widgets/header/Header";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[120px] font-extrabold leading-none tracking-tight text-[#8E8BED]">
          500
        </p>
        <h1 className="mt-4 text-[28px] font-bold leading-[1.2] text-[#1A1A1A]">
          Что-то пошло не так
        </h1>
        <p className="mt-3 max-w-[420px] text-[16px] leading-[1.5] text-[#626262]">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-[44px] items-center justify-center rounded-[36px] bg-[#8E8BED] px-8 text-[15px] font-semibold !text-white transition-colors hover:bg-[#7A77E0]"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex h-[44px] items-center justify-center rounded-[36px] border border-[#CACACA] bg-white px-8 text-[15px] font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5]"
          >
            На главную
          </Link>
        </div>
      </main>
    </>
  );
}
