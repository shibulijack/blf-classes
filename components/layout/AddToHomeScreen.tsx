"use client";

import { useState, useEffect } from "react";

export function AddToHomeScreen() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    try {
      // Don't show if already in standalone PWA mode
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          (window.navigator as unknown as { standalone: boolean }).standalone);
      if (isStandalone) return;

      // Don't show if user dismissed it before
      if (localStorage.getItem("blf_a2hs_dismissed")) return;

      const ua = navigator.userAgent;
      const ios = /iPad|iPhone|iPod/.test(ua);
      setIsIOS(ios);
      setShow(true);
    } catch {
      // localStorage or matchMedia not available — skip
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("blf_a2hs_dismissed", "1");
  }

  if (!show) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center gap-3">
      <div className="flex-1 text-xs leading-snug">
        {isIOS ? (
          <>
            Tap{" "}
            <svg className="inline w-4 h-4 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M12 2.25v12m0-12l3 3m-3-3l-3 3" />
            </svg>
            {" "}then &quot;Add to Home Screen&quot; for quick access
          </>
        ) : (
          <>
            Add BLF to your home screen for quick access
          </>
        )}
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 p-1 rounded-full hover:bg-blue-500 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
