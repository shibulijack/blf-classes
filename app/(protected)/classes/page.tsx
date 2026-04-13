import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getClasses } from "@/lib/classes/queries";
import { ClassCard } from "@/components/classes/ClassCard";
import { FilterBar } from "@/components/classes/FilterBar";
import { SearchInput } from "@/components/classes/SearchInput";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ClassesPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;
  const classes = await getClasses(
    {
      category: params.category,
      day: params.day,
      search: params.search,
      ageGroup: params.ageGroup,
    },
    session.residentId
  );

  return (
    <div>
      <div className="sticky top-0 z-40 glass-strong safe-top">
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-auto rounded shrink-0" />
              <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Classes</h1>
            </div>
            <ThemeToggle />
          </div>
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>
        <div className="px-4 pb-3">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {classes.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
              />
            </svg>
            <p className="text-gray-500 font-medium">No classes found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or be the first to add one!
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              {classes.length} class{classes.length !== 1 && "es"}
            </p>
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </>
        )}

        {/* Add class nudge */}
        <div className="mt-6 mb-4 mx-auto text-center glass-card rounded-2xl p-5">
          <p className="text-sm text-gray-700 font-medium">
            Know a class that&apos;s not listed here?
          </p>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Help the community by adding it!
          </p>
          <Link
            href="/classes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add a Class
          </Link>
        </div>
      </div>
    </div>
  );
}
