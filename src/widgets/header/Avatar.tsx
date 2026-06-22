import { forwardRef, type ButtonHTMLAttributes } from "react";

type AvatarProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(function Avatar(
  { className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Профиль"
      className={`flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#8E8BED] text-[18px] font-semibold leading-none tracking-[-0.036px] text-white transition hover:brightness-[0.98] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      E
    </button>
  );
});
