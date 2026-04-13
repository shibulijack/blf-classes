"use client";

import { useState, useTransition } from "react";
import { deleteClass } from "@/lib/classes/actions";

interface DeleteClassButtonProps {
  classId: string;
  classTitle: string;
}

export function DeleteClassButton({ classId, classTitle }: DeleteClassButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClass(classId);
      if (result?.error) {
        alert(result.error);
        setShowConfirm(false);
      }
    });
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Delete Class
      </button>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-red-800">
        Delete &quot;{classTitle}&quot;? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:bg-gray-300"
        >
          {isPending ? "Deleting..." : "Confirm Delete"}
        </button>
      </div>
    </div>
  );
}
