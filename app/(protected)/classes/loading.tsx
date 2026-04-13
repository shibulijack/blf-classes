export default function ClassesLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="glass-strong safe-top">
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-20 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
            <div className="h-4 w-16 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          </div>
          <div className="h-10 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
        </div>
        <div className="px-4 pb-3 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-16 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse shrink-0" />
            ))}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-14 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Card skeletons */}
      <div className="px-4 py-4 space-y-3">
        <div className="h-4 w-16 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              <div className="h-4 w-24 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
              <div className="h-4 w-32 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
