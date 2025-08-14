"use client"
export const useMediaQuery = () => {
  // Value obtained based on tailwind where md is equivalent to 768px
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isMobileTablet = window.matchMedia('(max-width: 1024px)').matches;
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  const isDesktopX2 = window.matchMedia('(min-width: 1280px)').matches;

  return {
    isMobile,
    isMobileTablet,
    isDesktop,
    isDesktopX2
  }
}