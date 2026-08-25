import type { IconProps } from "./types";

export const CHAT_BUBBLE_ICON_SIZE = { width: 20, height: 20 } as const;

/** Two overlapping chat bubbles with typing dots — stroke rounded */
export function ChatBubbleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={CHAT_BUBBLE_ICON_SIZE.width}
      height={CHAT_BUBBLE_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M17.9028 8.85107C17.9028 5.22055 14.7403 2.25 10.8264 2.25C6.91255 2.25 3.75006 5.22055 3.75006 8.85107C3.75006 10.2323 4.20639 11.5051 4.98168 12.5337C5.15863 12.7694 5.23429 13.0723 5.17496 13.3633C5.04997 13.977 4.81323 14.5569 4.48346 15.0698C5.47754 15.259 6.51862 15.1273 7.43112 14.7143C7.65251 14.6142 7.89406 14.6036 8.12174 14.6702C8.92508 14.9074 9.79491 15.0387 10.7032 15.0387"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.375 15.75C12.375 18.6495 14.7255 21 17.625 21C18.0116 21 18.3857 20.9582 18.7423 20.8795C18.9814 20.8267 19.101 20.8003 19.1779 20.8183C19.2549 20.8363 19.3435 20.8993 19.5208 21.0253C20.0761 21.4196 20.7742 21.5993 21.4703 21.5174C21.1948 21.1449 20.9663 20.7263 20.7972 20.2736C20.7267 20.0847 20.8381 19.8849 21.0019 19.7554C21.7396 19.1716 22.2 18.289 22.2 17.3025C22.2 14.403 19.8495 12.0525 16.95 12.0525C14.0505 12.0525 11.7 14.403 11.7 17.3025"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.6 17.25H15.609"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.7 17.25H17.709"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.8 17.25H19.809"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
