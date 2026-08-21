import type { ImgHTMLAttributes } from "react";

export function LogoIcon({
  className,
  alt = "",
  src = "/logo.svg",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={className} {...props} />;
}
