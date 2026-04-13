"use client";

import { useTheme } from "./ThemeProvider";

export function Logo({ className }: { className?: string }) {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? "/icons/logo_white.webp" : "/icons/logo.webp";

  return <img src={src} alt="BLF" className={className} />;
}
