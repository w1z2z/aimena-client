import type { ImgHTMLAttributes } from "react";

export function LogoIcon({
  className,
  alt = "",
  src = "/logo.png",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={className} {...props} />;
}
