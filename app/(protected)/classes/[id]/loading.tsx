import { PageHeader } from "@/components/layout/PageHeader";

export default function ClassDetailLoading() {
  return (
    <div>
      <PageHeader title="Class Details" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Category + badges */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-16 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          </div>
          <div className="h-8 w-3/4 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          <div className="h-5 w-1/3 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse mt-2" />
        </div>

        {/* Image placeholder */}
        <div className="h-48 rounded-2xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />

        {/* Action buttons */}
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          <div className="h-10 w-24 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
        </div>

        {/* Detail rows */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-16 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-12 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
