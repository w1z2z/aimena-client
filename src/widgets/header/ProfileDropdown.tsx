import Link from "next/link";

import { LogoutIcon } from "@/shared/ui/icons";

import { HeaderDropdownPanel } from "./HeaderDropdownPanel";

const profile = {
  name: "Иван Персонянков",
  email: "wbokmedia@gmail.com",
};

const menuButtonClassName =
  "flex h-[36px] w-full items-center rounded-[8px] border border-[#CACACA] border-[0.5px] px-[10px] text-left text-[14px] font-semibold leading-[1.2] tracking-[-0.028px] text-[#1A1A1A] transition hover:bg-[#FAFAFA]";

type ProfileDropdownProps = {
  onClose?: () => void;
};

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  return (
    <HeaderDropdownPanel className="w-[260px] border border-[#8E8BED] bg-white p-[14px] text-[#1A1A1A]">
      <div className="flex flex-col gap-[14px]">
        <div className="flex items-center gap-[10px]">
          <div className="h-[52px] w-[52px] shrink-0 rounded-full bg-[#3D3D3D]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-[1.2] tracking-[-0.028px] text-[#1A1A1A]">
              {profile.name}
            </p>
            <p className="mt-[2px] truncate text-[12px] font-bold leading-[16px] tracking-[0.012px] text-[#8E8BED]">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <Link href="/profile" className={`${menuButtonClassName} text-[#1A1A1A]`} onClick={onClose}>
            Перейти в профиль
          </Link>
          <Link href="/profile/settings" className={`${menuButtonClassName} text-[#1A1A1A]`} onClick={onClose}>
            Настройки профиля
          </Link>
        </div>

        <button type="button" className={`${menuButtonClassName} gap-[8px] text-[#FF2056]`}>
          <LogoutIcon className="h-[14px] w-[14px] shrink-0" />
          Выйти из аккаунта
        </button>
      </div>
    </HeaderDropdownPanel>
  );
}
