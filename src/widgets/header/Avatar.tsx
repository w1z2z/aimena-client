import { forwardRef, type ButtonHTMLAttributes } from "react";

type AvatarProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  initial?: string;
};

export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(function Avatar(
  { className, initial = "E", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Профиль"
      className={`box-border flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#8E8BED] text-[18px] font-semibold leading-none tracking-[-0.036px] text-white transition hover:brightness-[0.98] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      {initial}
    </button>
  );
});
