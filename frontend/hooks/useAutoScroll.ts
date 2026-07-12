import { useRef, useEffect, RefObject } from "react";

/**
 * Custom React hook to manage automatic scrolling of scroll containers (like chat views).
 * Triggers scroll-to-bottom on dependency additions, with sensitivity checks to see if 
 * the user has scrolled up to read earlier responses.
 */
export function useAutoScroll<T extends HTMLElement>(dependency: any[]): [RefObject<T | null>, () => void] {
  const containerRef = useRef<T | null>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      // Calculate how close the user is to the bottom
      const threshold = 150; // pixels
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [dependency]);

  return [containerRef, scrollToBottom];
}
export default useAutoScroll;
