import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes/queries";
import { InterestButton } from "@/components/classes/InterestButton";
import { VerifyButton } from "@/components/classes/VerifyButton";
import { ReportButton } from "@/components/classes/ReportButton";
import { ShareButtons } from "@/components/classes/ShareButtons";
import { StatBadge } from "@/components/classes/StatBadge";
import { ClassOwnerActions } from "@/components/classes/ClassOwnerActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { CATEGORY_COLORS, DAYS_OF_WEEK } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;
  const cls = await getClassById(id, session.residentId);
  if (!cls) notFound();

  const isOwner = cls.created_by === session.residentId;
  const dayLabels = cls.day_of_week
    .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label)
    .filter(Boolean);

  return (
    <div>
      <PageHeader title="Class Details" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  CATEGORY_COLORS[cls.category]
                }`}
              >
                {cls.category.charAt(0).toUpperCase() + cls.category.slice(1)}
              </span>
              {cls.age_group && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/40 px-2.5 py-1 rounded-full">
                  {cls.age_group}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <StatBadge
                count={cls.verification_count}
                label={`Verified by ${cls.verification_count} resident${cls.verification_count !== 1 ? "s" : ""}`}
                colorClass="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatBadge
                count={cls.interest_count}
                label={`${cls.interest_count} resident${cls.interest_count !== 1 ? "s" : ""} interested`}
                colorClass="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                icon={
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                  </svg>
                }
              />
              <StatBadge
                count={cls.report_count}
                label={`Reported by ${cls.report_count} resident${cls.report_count !== 1 ? "s" : ""}`}
                colorClass="bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                }
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cls.title}</h2>
          {cls.tutor_name && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">by {cls.tutor_name}</p>
          )}
          {isOwner && (
            <div className="mt-3">
              <ClassOwnerActions classId={cls.id} classTitle={cls.title} />
            </div>
          )}
        </div>

        {/* Class image */}
        {cls.image_url && (
          <div className="rounded-2xl overflow-hidden">
            <img
              src={cls.image_url}
              alt={cls.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Action buttons */}
        {!isOwner && (
          <div className="flex flex-wrap items-center gap-3">
            <InterestButton
              classId={cls.id}
              isInterested={cls.is_interested}
              interestCount={cls.interest_count}
            />
            <VerifyButton
              classId={cls.id}
              isVerified={cls.is_verified_by_me}
              verificationCount={cls.verification_count}
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          {dayLabels.length > 0 && (
            <DetailRow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              label="Schedule"
              value={`${dayLabels.join(", ")}${cls.time_slot ? ` \u00b7 ${cls.time_slot}` : ""}`}
            />
          )}
          {cls.location && (
            <DetailRow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              }
              label="Location"
              value={cls.location}
            />
          )}
          {cls.fee && (
            <DetailRow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Monthly Fees"
              value={cls.fee}
            />
          )}
          {cls.tutor_contact && (
            <DetailRow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              }
              label="Contact"
              value={cls.tutor_contact}
            />
          )}
          {cls.max_students && (
            <DetailRow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
              label="Max students"
              value={cls.max_students.toString()}
            />
          )}
        </div>

        {/* Description */}
        {cls.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {cls.description}
            </p>
          </div>
        )}

        {/* Share */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <ShareButtons cls={cls} />
        </div>

        {/* Report */}
        {!isOwner && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <ReportButton classId={cls.id} isReported={cls.is_reported_by_me} />
          </div>
        )}

        {/* Posted by */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400">
          Posted by {cls.creator_name ? `${cls.creator_name} (${cls.creator_apartment})` : cls.creator_apartment} &middot;{" "}
          {new Date(cls.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 dark:text-gray-500 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}
