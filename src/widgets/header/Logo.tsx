import Link from "next/link";

import { LogoIcon } from "@/shared/ui/icons";

export function Logo() {
  return (
    <Link href="/" className="inline-flex h-[41px] w-[101px] items-start overflow-hidden" aria-label="На главную">
      <LogoIcon
        className="block h-full w-full object-fill"
        style={{ transform: "translateX(-9px) scale(1.22)", transformOrigin: "left center" }}
      />
    </Link>
  );
}
