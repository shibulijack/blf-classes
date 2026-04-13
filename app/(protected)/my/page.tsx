import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMyClasses } from "@/lib/classes/queries";
import { ClassCard } from "@/components/classes/ClassCard";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function MyClassesPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const { created, registered } = await getMyClasses(session.residentId);

  return (
    <div>
      <PageHeader title="My Classes" />

      <div className="px-4 py-4 space-y-6">
        {/* Created classes */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Classes I Posted ({created.length})
          </h2>
          {created.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              You haven&apos;t posted any classes yet.
            </p>
          ) : (
            <div className="space-y-3">
              {created.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          )}
        </section>

        {/* Registered classes */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Interested In ({registered.length})
          </h2>
          {registered.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              You haven&apos;t shown interest in any classes yet.
            </p>
          ) : (
            <div className="space-y-3">
              {registered.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
