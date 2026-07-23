import type { ImgHTMLAttributes } from "react";

import mainLogo from "./MainLogo.svg";

export function LogoIcon({ className, alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={mainLogo.src} alt={alt} className={className} {...props} />;
}
