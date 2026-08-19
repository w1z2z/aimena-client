import type { ImgHTMLAttributes } from "react";

export function LogoIcon({ className, alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/logo.svg" alt={alt} className={className} {...props} />;
}
