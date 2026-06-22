import { useId } from "react";

import type { IconProps } from "./types";

type TabIconProps = IconProps & {
  active?: boolean;
};

export function WantBrowseIcon({ active, className, ...props }: TabIconProps) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M7.21094 0.555664C7.51069 0.148897 8.11822 0.148897 8.41797 0.555664L11.1299 4.23438C11.2043 4.33541 11.2935 4.42457 11.3945 4.49902L15.0732 7.21094C15.48 7.51069 15.48 8.11822 15.0732 8.41797L11.3945 11.1299C11.2935 11.2043 11.2043 11.2935 11.1299 11.3945L8.41797 15.0732C8.11822 15.48 7.51069 15.48 7.21094 15.0732L4.49902 11.3945C4.42457 11.2935 4.33541 11.2043 4.23438 11.1299L0.555664 8.41797C0.148897 8.11822 0.148897 7.51069 0.555664 7.21094L4.23438 4.49902C4.33541 4.42457 4.42457 4.33541 4.49902 4.23438L7.21094 0.555664Z"
        fill={active ? "white" : `url(#${gradientId})`}
        stroke="white"
        strokeWidth="0.5"
      />
      {!active && (
        <defs>
          <linearGradient id={gradientId} x1="5.68945" y1="4.41445" x2="20.9895" y2="20.5645" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8E8BED" />
            <stop offset="1" stopColor="#C8FF00" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
