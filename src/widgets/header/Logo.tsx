import Link from "next/link";

import { LogoIcon } from "@/shared/ui/icons";

export function Logo() {
  return (
    <Link href="/" className="flex h-[54px] w-[71px] items-start" aria-label="На главную">
      <LogoIcon className="h-[54px] w-[71px]" />
    </Link>
  );
}
