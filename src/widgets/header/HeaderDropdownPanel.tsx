import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type HeaderDropdownPanelProps = ComponentPropsWithoutRef<"div"> & {
  className: string;
};

const gradientBorderStyle: CSSProperties = {
  background:
    "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
};

export function HeaderDropdownPanel({ children, className, style, ...props }: HeaderDropdownPanelProps) {
  return (
    <div
      className={`box-border shrink-0 border-[0.3px] border-solid border-transparent shadow-[0_4px_20px_rgb(0_0_0/10%)] ${className}`}
      style={{ ...gradientBorderStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
