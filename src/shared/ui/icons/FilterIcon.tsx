import type { IconProps } from "./types";

export const FILTER_ICON_SIZE = { width: 16, height: 16 } as const;

export function FilterIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={FILTER_ICON_SIZE.width}
      height={FILTER_ICON_SIZE.height}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M2 4.66663H4"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 11.3334H6"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.3334H14"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.66663H14"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4.66663C4 4.04537 4 3.73475 4.10149 3.48971C4.23682 3.16301 4.49639 2.90345 4.82309 2.76812C5.06812 2.66663 5.37875 2.66663 6 2.66663C6.62125 2.66663 6.93187 2.66663 7.17693 2.76812C7.5036 2.90345 7.7632 3.16301 7.89853 3.48971C8 3.73475 8 4.04537 8 4.66663C8 5.28788 8 5.59851 7.89853 5.84354C7.7632 6.17024 7.5036 6.42981 7.17693 6.56513C6.93187 6.66663 6.62125 6.66663 6 6.66663C5.37875 6.66663 5.06812 6.66663 4.82309 6.56513C4.49639 6.42981 4.23682 6.17024 4.10149 5.84354C4 5.59851 4 5.28788 4 4.66663Z"
        stroke="currentColor"
        strokeWidth="1.33333"
      />
      <path
        d="M8 11.3334C8 10.7121 8 10.4015 8.10147 10.1564C8.2368 9.82977 8.4964 9.57017 8.82307 9.43484C9.06813 9.33337 9.37873 9.33337 10 9.33337C10.6213 9.33337 10.9319 9.33337 11.1769 9.43484C11.5036 9.57017 11.7632 9.82977 11.8985 10.1564C12 10.4015 12 10.7121 12 11.3334C12 11.9546 12 12.2652 11.8985 12.5103C11.7632 12.837 11.5036 13.0966 11.1769 13.2319C10.9319 13.3334 10.6213 13.3334 10 13.3334C9.37873 13.3334 9.06813 13.3334 8.82307 13.2319C8.4964 13.0966 8.2368 12.837 8.10147 12.5103C8 12.2652 8 11.9546 8 11.3334Z"
        stroke="currentColor"
        strokeWidth="1.33333"
      />
    </svg>
  );
}
