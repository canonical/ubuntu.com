import { RefObject, useCallback, useRef } from "react";

/**
 * Scroll an element into view if the top is not visible.
 * @param buffer Additional space to leave above the target.
 */
export const useScrollIntoView = <T extends HTMLElement>(
  buffer = 0
): [RefObject<T>, () => void] => {
  const htmlRef = useRef<HTMLElement>(document.querySelector("html"));
  const targetRef = useRef<T | null>(null);
  const scrollIntoView = useCallback(() => {
    if (targetRef?.current && htmlRef?.current) {
      const { y: targetTop } = targetRef.current.getBoundingClientRect();
      const windowTop = htmlRef.current.scrollTop;
      // Whether the top of the target is above the top of the screen.
      const topOffTop = targetTop < 0;
      if (topOffTop) {
        window.scrollTo({
          top: windowTop - buffer + targetTop,
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }, []);
  return [targetRef, scrollIntoView];
};
