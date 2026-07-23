import { forwardRef, type ButtonHTMLAttributes } from "react";

type AvatarProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  initial?: string;
  src?: string | null;
};

export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(function Avatar(
  { className, initial = "E", src, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Профиль"
      className={`relative box-border flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border-0 bg-[#FFFFFF] p-0 text-[18px] font-semibold leading-none tracking-[-0.036px] text-[#8E8BED] ${className ?? ""}`}
      {...props}
    >
      {src ? (
        <img src={src} alt="" draggable={false} className="absolute inset-0 block h-full w-full object-cover" />
      ) : (
        initial
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[13px]"
        style={{
          padding: 1,
          backgroundImage: "linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%)",
          WebkitMask:
            "linear-gradient(#ffffff 0 0) content-box, linear-gradient(#ffffff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#ffffff 0 0) content-box, linear-gradient(#ffffff 0 0)",
          maskComposite: "exclude",
        }}
      />
    </button>
  );
});
