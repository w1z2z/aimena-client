import { forwardRef, type ButtonHTMLAttributes } from "react";

type AvatarProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  initial?: string;
  src?: string | null;
};

export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(function Avatar(
  { className, initial = "E", src, style, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Профиль"
      className={`box-border flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border-[0.3px] border-solid border-transparent bg-[#FFFFFF] p-0 text-[18px] font-semibold leading-none tracking-[-0.036px] text-[#8E8BED] [appearance:none] ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
        ...style,
      }}
      {...props}
    >
      {src ? (
        <img src={src} alt="" draggable={false} className="h-full w-full object-cover object-center" />
      ) : (
        initial
      )}
    </button>
  );
});
