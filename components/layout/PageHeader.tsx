"use client";

import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, showBack, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-top">
      <div className="max-w-lg mx-auto relative px-4 py-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {action && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{action}</div>
        )}
        <div className="flex flex-col items-center">
          <img src="/icons/logo.webp" alt="BLF" className="h-7 w-auto rounded" />
          <h1 className="text-sm font-semibold text-gray-900 mt-0.5">{title}</h1>
        </div>
      </div>
    </header>
  );
}
