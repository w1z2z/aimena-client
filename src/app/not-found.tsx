import Link from "next/link";

import { Header } from "@/widgets/header/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[120px] font-extrabold leading-none tracking-tight text-[#8E8BED]">
          404
        </p>
        <h1 className="mt-4 text-[28px] font-bold leading-[1.2] text-[#1A1A1A]">
          Страница не найдена
        </h1>
        <p className="mt-3 max-w-[420px] text-[16px] leading-[1.5] text-[#626262]">
          Возможно, она была удалена или вы перешли по неверной ссылке.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-[44px] items-center justify-center rounded-[36px] bg-[#8E8BED] px-8 text-[15px] font-semibold !text-white transition-colors hover:bg-[#7A77E0]"
        >
          На главную
        </Link>
      </main>
    </>
  );
}
