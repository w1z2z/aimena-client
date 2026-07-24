import Link from "next/link";

import { LoginIcon } from "@/shared/ui/icons";

export function LoginButton() {
  return (
    <Link
      href="/login"
      aria-label="Войти"
      className="box-border flex h-[32px] w-[32px] items-center justify-center overflow-visible rounded-[13px] border-[0.3px] border-solid border-[#8E8BED] bg-[#FFFFFF] text-black transition-colors hover:bg-[#fafaff]"
    >
      <LoginIcon className="h-[16px] w-[16px] text-black" />
    </Link>
  );
}
