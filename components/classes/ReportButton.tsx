"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/lib/classes/actions";
import { REPORT_REASONS } from "@/lib/types";

interface ReportButtonProps {
  classId: string;
  isReported: boolean;
}

export function ReportButton({ classId, isReported }: ReportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(isReported);

  function handleSubmit() {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await submitReport(classId, reason, details);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setShowForm(false);
      }
    });
  }

  if (submitted) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
        Reported
      </span>
    );
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          Report
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">Report this class</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  reason === r
                    ? "bg-red-200 text-red-800 font-medium"
                    : "bg-white text-gray-700 hover:bg-red-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-red-200 placeholder:text-gray-400"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setReason(""); setDetails(""); setError(""); }}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:bg-gray-300"
            >
              {isPending ? "..." : "Submit Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
