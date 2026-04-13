"use client";

import Image from "next/image";
import { useTheme } from "./ThemeProvider";

export function Logo({ className }: { className?: string }) {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? "/icons/logo_white.webp" : "/icons/logo.webp";

  return (
    <Image
      src={src}
      alt="BLF"
      width={120}
      height={28}
      className={className}
      priority
    />
  );
}
