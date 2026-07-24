import Link from "next/link";

import { LogoIcon } from "@/shared/ui/icons";

const footerNav = [
  {
    title: "Сервис",
    links: [
      { label: "Объявления", href: "/listings" },
      { label: "Отдаю даром", href: "/listings" },
      { label: "Разместить", href: "/create-listing" },
      { label: "Чаты", href: "/chats" },
    ],
  },
  {
    title: "Помощь",
    links: [
      { label: "Как это работает", href: "#" },
      { label: "Безопасность", href: "#" },
      { label: "Поддержка", href: "#" },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "О проекте", href: "#" },
      { label: "Правила", href: "#" },
      { label: "Контакты", href: "#" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link href="/" className="site-footer__logo" aria-label="Aimena — на главную">
              <LogoIcon className="site-footer__logo-icon" />
            </Link>
            <p className="site-footer__tagline">
              Обменивайтесь вещами и услугами без лишних трат
            </p>
          </div>

          <div className="site-footer__nav">
            {footerNav.map((group) => (
              <div key={group.title} className="site-footer__nav-group">
                <p className="site-footer__nav-title">{group.title}</p>
                <ul className="site-footer__nav-list">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="site-footer__nav-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© {new Date().getFullYear()} Aimena</p>
          <div className="site-footer__legal">
            <Link href="/privacy" className="site-footer__legal-link">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="site-footer__legal-link">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
