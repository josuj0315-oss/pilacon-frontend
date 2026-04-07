import { useEffect, useMemo, useState } from "react";

export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1199,
  desktopMin: 1200,
};

export function getDeviceType(width) {
  if (width >= BREAKPOINTS.desktopMin) return "desktop";
  if (width >= BREAKPOINTS.tabletMin) return "tablet";
  return "mobile";
}

export default function useDevice() {
  const getWidth = () => {
    if (typeof window === "undefined") return BREAKPOINTS.desktopMin;
    return window.innerWidth;
  };

  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return useMemo(() => {
    const type = getDeviceType(width);
    return {
      width,
      type,
      isMobile: type === "mobile",
      isTablet: type === "tablet",
      isDesktop: type === "desktop",
    };
  }, [width]);
}
