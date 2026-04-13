"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface StatBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  colorClass: string;
}

export function StatBadge({ icon, count, label, colorClass }: StatBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionTooltip = useCallback(() => {
    const btn = buttonRef.current;
    const tip = tooltipRef.current;
    if (!btn || !tip) return;

    // Reset position to measure natural width
    tip.style.left = "50%";
    tip.style.transform = "translateX(-50%)";

    const tipRect = tip.getBoundingClientRect();
    const padding = 8;

    if (tipRect.right > window.innerWidth - padding) {
      const overflow = tipRect.right - window.innerWidth + padding;
      tip.style.left = `calc(50% - ${overflow}px)`;
    } else if (tipRect.left < padding) {
      const overflow = padding - tipRect.left;
      tip.style.left = `calc(50% + ${overflow}px)`;
    }
  }, []);

  function handleTap() {
    setShowTooltip(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(false), 2000);
  }

  useEffect(() => {
    if (showTooltip) positionTooltip();
  }, [showTooltip, positionTooltip]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (count === 0) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleTap}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${colorClass}`}
      >
        {icon}
        {count}
      </button>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
