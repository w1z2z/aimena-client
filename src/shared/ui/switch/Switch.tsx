import { ToggleStarIcon } from "@/shared/ui/icons";

type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

export function Switch({ checked, onChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[44px] shrink-0 overflow-visible rounded-full border border-[#8E8BED] transition-colors duration-200 ${
        checked ? "bg-[#8E8BED]" : "bg-white"
      }${className ? ` ${className}` : ""}`}
    >
      <span
        className={`absolute top-[2px] flex h-[18px] w-[18px] items-center justify-center overflow-visible rounded-full transition-[left,background-color] duration-200 ease-out ${
          checked ? "left-[22px] bg-white" : "left-[2px] bg-[#8E8BED]"
        }`}
      >
        <ToggleStarIcon
          className={`h-[10px] w-[10px] translate-y-[-0.5px] ${checked ? "text-[#8E8BED]" : "text-white"}`}
        />
      </span>
    </button>
  );
}
