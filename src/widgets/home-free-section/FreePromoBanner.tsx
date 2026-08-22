import Link from "next/link";

export function FreePromoBanner() {
  return (
    <div className="home-free-promo">
      <div className="home-free-promo__copy">
        <h3 className="home-free-promo__title">Всё даром</h3>
        <p className="home-free-promo__text">Люди отдают всё что угодно. Просто так.</p>
      </div>

      <Link href="/free" className="home-free-promo__button">
        <span className="home-free-promo__button-label">Посмотреть</span>
      </Link>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/free-promo-star.png"
        alt=""
        width={304}
        height={393}
        aria-hidden
        className="home-free-promo__star"
      />
    </div>
  );
}
