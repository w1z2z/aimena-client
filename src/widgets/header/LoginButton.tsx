import Link from "next/link";

import { LoginIcon } from "@/shared/ui/icons";

export function LoginButton() {
  return (
    <Link
      href="/login"
      aria-label="Войти"
      title="Войти"
      className="box-border relative flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-visible rounded-[36px] border-[0.3px] border-solid border-[#8E8BED] bg-[#FFFFFF] text-black transition-colors hover:bg-[#f0e8ff]"
    >
      <LoginIcon className="h-[16px] w-[16px] text-black" />
    </Link>
  );
}
