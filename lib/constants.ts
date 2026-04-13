import { Category } from "./types";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "dance", label: "Dance" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "sports", label: "Sports" },
  { value: "academics", label: "Academics" },
  { value: "wellness", label: "Wellness" },
  { value: "other", label: "Other" },
];

export const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
] as const;

export const AGE_GROUPS = [
  "3-5 years",
  "5-8 years",
  "8-12 years",
  "Teens (13-17)",
  "Adults",
  "All ages",
] as const;

// Generate time options from 5:00 AM to 10:00 PM in 30-min intervals
export const TIME_OPTIONS: string[] = (() => {
  const times: string[] = [];
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const min = m.toString().padStart(2, "0");
      times.push(`${hour12}:${min} ${ampm}`);
    }
  }
  return times;
})();

export const CATEGORY_COLORS: Record<Category, string> = {
  dance: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  music: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  art: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  sports: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  academics: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  wellness: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
};

// Emoji placeholders for category thumbnails
export const CATEGORY_EMOJI: Record<Category, string> = {
  dance: "\ud83d\udc83",
  music: "\ud83c\udfb5",
  art: "\ud83c\udfa8",
  sports: "\u26bd",
  academics: "\ud83d\udcda",
  wellness: "\ud83e\uddd8",
  other: "\ud83d\udccb",
};

export const CATEGORY_BG: Record<Category, string> = {
  dance: "bg-pink-50 dark:bg-pink-900/30",
  music: "bg-purple-50 dark:bg-purple-900/30",
  art: "bg-orange-50 dark:bg-orange-900/30",
  sports: "bg-green-50 dark:bg-green-900/30",
  academics: "bg-blue-50 dark:bg-blue-900/30",
  wellness: "bg-teal-50 dark:bg-teal-900/30",
  other: "bg-gray-50 dark:bg-gray-800/30",
};
