"use client";

import { useTransition, useOptimistic } from "react";
import { toggleVerification } from "@/lib/classes/actions";

interface VerifyButtonProps {
  classId: string;
  isVerified: boolean;
  verificationCount: number;
}

export function VerifyButton({
  classId,
  isVerified,
  verificationCount,
}: VerifyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { verified: isVerified, count: verificationCount },
    (state) => ({
      verified: !state.verified,
      count: state.verified ? state.count - 1 : state.count + 1,
    })
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic(optimistic);
      await toggleVerification(classId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
        optimistic.verified
          ? "bg-green-600 text-white"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {optimistic.verified ? "Verified" : "Verify"}
      {optimistic.count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          optimistic.verified ? "bg-green-500" : "bg-green-100"
        }`}>
          {optimistic.count}
        </span>
      )}
    </button>
  );
}
