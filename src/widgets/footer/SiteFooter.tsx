/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const serviceLinks = [
  { label: "Создать объявление", href: "/create-listing" },
  { label: "Чаты", href: "/chats" },
  { label: "Отдают даром", href: "/free" },
  { label: "Избранное", href: "/favorites" },
  { label: "Ваши объявления", href: "/profile" },
] as const;

const helpLinks = [
  { label: "Пользовательское соглашение", href: "/terms" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "О проекте", href: "/about" },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname.startsWith("/chats")) return null;

  return (
    <footer className="site-footer">
      <img
        src="/images/footer/deco-left.svg"
        alt=""
        aria-hidden
        className="site-footer__deco site-footer__deco--left"
      />
      <img
        src="/images/footer/deco-right.svg"
        alt=""
        aria-hidden
        className="site-footer__deco site-footer__deco--right"
      />

      <div className="site-footer__inner">
        <div className="site-footer__content">
          <Link href="/" className="site-footer__logo" aria-label="Aimena — на главную">
            <img
              src="/images/footer/logo-mark.svg"
              alt=""
              className="site-footer__logo-mark"
            />
          </Link>

          <nav className="site-footer__stack" aria-label="Сервис">
            <p className="site-footer__title">Сервис</p>
            {serviceLinks.map((link) => (
              <Link key={link.label} href={link.href} className="site-footer__link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-footer__stack">
            <p className="site-footer__title">ООО “Эософт”</p>
            <p className="site-footer__body">ИНН 2308298440</p>
            <p className="site-footer__body">ОГРН 12423000047527</p>
            <p className="site-footer__body site-footer__body--address">
              350000, Краснодарский край, г. Краснодар, ул. Им. Братьев Игнатовых, д. 1/1,
              помещ. 12
            </p>
            <a href="mailto:info@eosoft.ru" className="site-footer__label">
              info@eosoft.ru
            </a>
            <a
              href="https://eosoft.ru"
              className="site-footer__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              eosoft.ru
            </a>
            <a href="tel:+78619913171" className="site-footer__label">
              +7 (861) 991-31-71
            </a>
          </div>

          <div className="site-footer__help">
            <nav className="site-footer__stack" aria-label="Помощь">
              <p className="site-footer__title">Помощь</p>
              {helpLinks.map((link) => (
                <Link key={link.label} href={link.href} className="site-footer__link">
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="site-footer__copyright">{year} Aimena</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
