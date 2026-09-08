import { useEffect, useState } from "react";

export function useResponsiveLayout() {
  const [width, setWidth] = useState(1440);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    narrow: width < 1000,
  };
}
