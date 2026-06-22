import { Avatar } from "./Avatar";
import { ButtonPrimary } from "./ButtonPrimary";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { BellDotIcon, BellIcon, HeartIcon } from "@/shared/ui/icons";

export function Header() {
  return (
    <header className="relative h-[54px] w-[1440px]">
      <div className="relative h-full w-full">
        <div className="absolute left-[10px] top-0 flex h-[54px] items-start">
          <Logo />
        </div>

        <div className="absolute left-[1049px] top-[11px] flex items-center justify-end gap-[16px]">
          <ButtonPrimary>Разместить предложение</ButtonPrimary>

          <IconButton label="Уведомления">
            <span className="relative inline-flex items-center justify-center">
              <BellIcon className="h-[16.4px] w-[14.6px] text-black" />
              <BellDotIcon className="absolute -right-[3px] -top-[3px] h-[5px] w-[5px] text-[#FF2056]" />
            </span>
          </IconButton>

          <IconButton label="Избранное">
            <HeartIcon className="h-[11px] w-[13px] text-black" />
          </IconButton>

          <Avatar />
        </div>
      </div>
    </header>
  );
}
