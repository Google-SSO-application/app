import { useEffect, useCallback } from "react";

/**
 * Listens to window resize and calls `onResize(width)` immediately on mount
 * and on every subsequent resize event.
 */
export function useWindowWidth(onResize) {
  const stable = useCallback(onResize, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => stable(window.innerWidth);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [stable]);
}
