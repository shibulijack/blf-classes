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
  dance: "bg-pink-100 text-pink-700",
  music: "bg-purple-100 text-purple-700",
  art: "bg-orange-100 text-orange-700",
  sports: "bg-green-100 text-green-700",
  academics: "bg-blue-100 text-blue-700",
  wellness: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-700",
};
