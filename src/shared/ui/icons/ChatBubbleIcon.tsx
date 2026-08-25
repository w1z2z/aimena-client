import type { IconProps } from "./types";

export const CHAT_BUBBLE_ICON_SIZE = { width: 27, height: 27 } as const;

/** Desktop floating-chat FAB — original dual-bubble mark */
export function ChatBubbleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={CHAT_BUBBLE_ICON_SIZE.width}
      height={CHAT_BUBBLE_ICON_SIZE.height}
      viewBox="0 0 27 27"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M22.5002 10.125C21.6056 5.64137 17.4521 2.25 12.4645 2.25C6.82392 2.25 2.25024 6.58711 2.25024 11.9362C2.25024 14.5064 3.30571 16.8417 5.02736 18.5747C5.40642 18.9563 5.6595 19.4776 5.55736 20.0141C5.38879 20.8914 5.00679 21.7097 4.44743 22.3917C5.91913 22.663 7.4494 22.4187 8.76176 21.7268C9.22568 21.4823 9.45763 21.36 9.62132 21.3352C9.7359 21.3179 9.88516 21.3341 10.1252 21.3752"
        stroke="currentColor"
        strokeWidth="2.08333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.3752 18.2944C12.3752 21.5633 15.1459 24.2138 18.5627 24.2138C18.9645 24.2143 19.3651 24.1771 19.7597 24.1031C20.0438 24.0497 20.1859 24.023 20.285 24.0382C20.3841 24.0533 20.5247 24.1281 20.8058 24.2775C21.6007 24.7003 22.5277 24.8496 23.4193 24.6837C23.0804 24.267 22.849 23.767 22.7468 23.2308C22.685 22.903 22.8383 22.5844 23.0679 22.3512C24.1109 21.2921 24.7502 19.865 24.7502 18.2944C24.7502 15.0255 21.9796 12.375 18.5627 12.375C15.1459 12.375 12.3752 15.0255 12.3752 18.2944Z"
        stroke="currentColor"
        strokeWidth="2.08333"
        strokeLinejoin="round"
      />
    </svg>
  );
}
