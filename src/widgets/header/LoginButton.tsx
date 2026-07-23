import Link from "next/link";

import { LoginIcon } from "@/shared/ui/icons";

export function LoginButton() {
  return (
    <Link
      href="/login"
      aria-label="Войти"
      className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-[#D9D9D9] text-[#1A1A1A] transition-colors hover:bg-[#d3d3d3]"
    >
      <LoginIcon className="h-[16px] w-[16px]" />
    </Link>
  );
}
