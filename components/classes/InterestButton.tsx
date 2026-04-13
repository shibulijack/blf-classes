"use client";

import { useTransition, useOptimistic } from "react";
import { toggleInterest } from "@/lib/classes/actions";

interface InterestButtonProps {
  classId: string;
  isInterested: boolean;
  interestCount: number;
}

export function InterestButton({
  classId,
  isInterested,
  interestCount,
}: InterestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimistic] = useOptimistic(
    { interested: isInterested, count: interestCount },
    (state) => ({
      interested: !state.interested,
      count: state.interested ? state.count - 1 : state.count + 1,
    })
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic(optimisticState);
      await toggleInterest(classId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
        optimisticState.interested
          ? "bg-blue-600/90 text-white shadow-md shadow-blue-600/20"
          : "glass-chip dark:!bg-slate-800/60 dark:!border-white/10 text-blue-600 dark:text-blue-400"
      }`}
    >
      <svg
        className="w-5 h-5"
        fill={optimisticState.interested ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
      {optimisticState.interested ? "Interested" : "I'm interested"}
      {optimisticState.count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          optimisticState.interested ? "bg-blue-500" : "bg-blue-100"
        }`}>
          {optimisticState.count}
        </span>
      )}
    </button>
  );
}
