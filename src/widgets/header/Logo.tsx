"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { LogoIcon } from "@/shared/ui/icons";

function forcePageScrollTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) main.scrollTop = 0;
}

export function Logo() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      forcePageScrollTop();
      return;
    }

    event.preventDefault();
    forcePageScrollTop();
    router.push("/", { scroll: true });
  };

  return (
    <Link
      href="/"
      scroll
      onClick={handleClick}
      className="inline-flex h-[41px] w-[101px] items-start overflow-hidden"
      aria-label="На главную"
    >
      <LogoIcon
        className="block h-full w-full object-fill"
        style={{ transform: "translateX(-9px) scale(1.22)", transformOrigin: "left center" }}
      />
    </Link>
  );
}
