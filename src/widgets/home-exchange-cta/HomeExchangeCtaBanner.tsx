"use client";

import { useRouter } from "next/navigation";

import { useAuthGate } from "@/features/auth";

export function HomeExchangeCtaBanner() {
  const router = useRouter();
  const { guardAuth } = useAuthGate();

  const handleCreateListing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    guardAuth("create-listing", () => router.push("/create-listing"));
  };

  return (
    <section className="bg-[#F8F8F5] pb-[68px] text-[#1A1A1A]">
      <div className="mx-auto w-full max-w-[1441px]">
        <div className="home-exchange-cta">
          <div className="home-exchange-cta__title">
            <p>Выгодный обмен без лишних слов</p>
          </div>
          <div className="home-exchange-cta__subtitle">
            <p>Добавьте свою вещь за 2 минуты и начните обмен прямо сейчас</p>
          </div>

          <button type="button" onClick={handleCreateListing} className="home-exchange-cta__button">
            <span className="home-exchange-cta__plus">+</span>
            <span className="home-exchange-cta__button-label">Добавить объявление</span>
          </button>
        </div>
      </div>
    </section>
  );
}
