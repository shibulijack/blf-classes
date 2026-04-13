"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, showBack, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 glass-strong safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shrink-0"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <Link href="/classes" className="shrink-0">
            <Logo className="h-7 w-auto rounded" />
          </Link>
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {action}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
