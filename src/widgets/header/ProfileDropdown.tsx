"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth";
import { LogoutIcon } from "@/shared/ui/icons";

import { HeaderDropdownPanel } from "./HeaderDropdownPanel";

const menuButtonClassName =
  "box-border flex h-[48px] w-full items-center rounded-[10px] border-[0.5px] border-solid border-[#CACACA] px-[12px] text-left text-[14px] font-semibold leading-[120%] tracking-[0.001em] transition hover:bg-[#FAFAFA]";

type ProfileDropdownProps = {
  onClose?: () => void;
};

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    void logout();
    onClose?.();
    router.push("/");
  };

  return (
    <HeaderDropdownPanel className="box-border flex w-[412px] flex-col items-start justify-center gap-[24px] rounded-[31px] bg-[#FFFFFF] p-[24px] text-[#1A1A1A]">
      <div className="flex min-h-[64px] w-full items-center gap-[12px]">
        <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[21px] bg-[#D9D9D9] text-[24px] font-extrabold leading-none text-[#1A1A1A]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            user.avatarInitial
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-[4px]">
          <p className="truncate text-[24px] font-extrabold leading-[130%] tracking-[-0.003em] text-[#1A1A1A]">
            {user.name}
          </p>
          <p className="truncate text-[14px] font-semibold leading-[140%] tracking-[0.001em] text-[#8E8BED]">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-[12px]">
        <Link href="/profile" className={`${menuButtonClassName} text-[#1A1A1A]`} onClick={onClose}>
          Перейти в профиль
        </Link>
        <Link href="/profile/settings" className={`${menuButtonClassName} text-[#1A1A1A]`} onClick={onClose}>
          Настройки профиля
        </Link>
        <button
          type="button"
          className={`${menuButtonClassName} gap-[12px] text-[#FF2056]`}
          onClick={handleLogout}
        >
          <LogoutIcon className="h-[18px] w-[18px] shrink-0 text-[#FF2056]" />
          Выйти из аккаунта
        </button>
      </div>
    </HeaderDropdownPanel>
  );
}
