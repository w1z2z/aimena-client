import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HeaderDropdownPanelProps = ComponentPropsWithoutRef<"div"> & {
  className: string;
};

export function HeaderDropdownPanel({ children, className, ...props }: HeaderDropdownPanelProps) {
  return (
    <div className={`shrink-0 rounded-[8px] shadow-[0_4px_20px_rgb(0_0_0/10%)] ${className}`} {...props}>
      {children}
    </div>
  );
}
