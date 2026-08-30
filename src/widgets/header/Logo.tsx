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

type LogoProps = {
  /** `dark` = purple logo2 for light surfaces; `brand` = white logo for dark/hero. */
  tone?: "brand" | "dark";
};

export function Logo({ tone = "brand" }: LogoProps) {
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
      className="inline-flex h-[54px] w-[162px] shrink-0 items-center"
      aria-label="На главную"
    >
      <LogoIcon
        src={tone === "dark" ? "/logo2.png" : "/logo.png"}
        width={162}
        height={tone === "dark" ? 53 : 54}
        className={
          tone === "dark"
            ? "block h-[53px] w-[162px] object-fill"
            : "block h-[54px] w-[162px] object-fill"
        }
      />
    </Link>
  );
}
