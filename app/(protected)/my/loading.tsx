import { PageHeader } from "@/components/layout/PageHeader";

export default function MyClassesLoading() {
  return (
    <div>
      <PageHeader title="My Classes" />

      <div className="px-4 py-4 space-y-6">
        {/* Created section */}
        <section>
          <div className="h-4 w-40 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse mb-3" />
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 mb-3">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-16 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Interested section */}
        <section>
          <div className="h-4 w-32 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse mb-3" />
          <div className="glass-card rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-200/50 dark:bg-gray-700/30 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 rounded-full bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-gray-200/50 dark:bg-gray-700/30 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
