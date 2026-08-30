export const HOME_RECOMMENDATIONS_HEADING_ID = "home-recommendations-heading";

export function scrollToHomeRecommendations(options?: {
  behavior?: ScrollBehavior;
  settleDelayMs?: number;
}) {
  if (typeof window === "undefined") return;

  const behavior = options?.behavior ?? "smooth";
  const settleDelayMs = options?.settleDelayMs ?? 280;

  const scroll = () => {
    document.getElementById(HOME_RECOMMENDATIONS_HEADING_ID)?.scrollIntoView({
      behavior,
      block: "start",
    });
  };

  window.requestAnimationFrame(() => {
    scroll();
    window.setTimeout(scroll, settleDelayMs);
  });
}
