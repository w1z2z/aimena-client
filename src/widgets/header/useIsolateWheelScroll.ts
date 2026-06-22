"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

function useIsolateWheelScroll(scrollRef: RefObject<HTMLDivElement | null>) {
  const isHoveringRef = useRef(false);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!isHoveringRef.current) return;

      const scrollEl = scrollRef.current;
      if (!scrollEl) {
        event.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

      if (maxScrollTop === 0) {
        event.preventDefault();
        return;
      }

      const nextScrollTop = Math.min(maxScrollTop, Math.max(0, scrollTop + event.deltaY));

      if (nextScrollTop !== scrollTop) {
        scrollEl.scrollTop = nextScrollTop;
      }

      event.preventDefault();
    },
    [scrollRef],
  );

  const onMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
  }, [handleWheel]);

  const onMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    window.removeEventListener("wheel", handleWheel, { capture: true });
  }, [handleWheel]);

  useEffect(() => {
    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, [handleWheel]);

  return { onMouseEnter, onMouseLeave };
}

export { useIsolateWheelScroll };
