import { LogoIcon } from "@/shared/ui/icons";

export function Logo() {
  return (
    <div className="flex h-[54px] w-[71px] items-start" aria-label="Логотип">
      <LogoIcon className="h-[54px] w-[71px]" />
    </div>
  );
}
