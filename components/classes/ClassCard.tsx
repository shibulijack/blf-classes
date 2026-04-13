import Link from "next/link";
import Image from "next/image";
import { ClassWithMeta } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_EMOJI, CATEGORY_BG, DAYS_OF_WEEK } from "@/lib/constants";

interface ClassCardProps {
  cls: ClassWithMeta;
}

export function ClassCard({ cls }: ClassCardProps) {
  const dayLabels = cls.day_of_week
    .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label)
    .filter(Boolean);

  const hasBadges = cls.verification_count > 0 || cls.interest_count > 0 || cls.report_count > 0;

  return (
    <Link href={`/classes/${cls.id}`} className="block">
      <div className="glass-card rounded-2xl p-4 transition-all active:scale-[0.98]">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
            {cls.image_url ? (
              <Image src={cls.image_url} alt="" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-3xl ${CATEGORY_BG[cls.category]}`}>
                {CATEGORY_EMOJI[cls.category]}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  CATEGORY_COLORS[cls.category]
                }`}
              >
                {cls.category.charAt(0).toUpperCase() + cls.category.slice(1)}
              </span>
              {cls.age_group && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/40 px-2 py-0.5 rounded-full">{cls.age_group}</span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{cls.title}</h3>
            {cls.tutor_name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">by {cls.tutor_name}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          {dayLabels.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {dayLabels.join(", ")}
            </span>
          )}
          {cls.time_slot && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {cls.time_slot}
            </span>
          )}
          {cls.location && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {cls.location}
            </span>
          )}
          {cls.fee && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {cls.fee}
            </span>
          )}
        </div>

        {/* Badges + Added by */}
        <div className="mt-3 flex items-center justify-between">
          {hasBadges ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {cls.verification_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {cls.verification_count} verified
                </span>
              )}
              {cls.interest_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                  </svg>
                  {cls.interest_count} interested
                </span>
              )}
              {cls.report_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {cls.report_count} reported
                </span>
              )}
            </div>
          ) : (
            <div />
          )}
          <p className="text-xs text-gray-400 shrink-0 ml-2">
            {cls.creator_name ? `${cls.creator_name} (${cls.creator_apartment})` : cls.creator_apartment}
          </p>
        </div>
      </div>
    </Link>
  );
}
