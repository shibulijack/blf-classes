export interface Resident {
  id: string;
  apartment: string;
  pin_hash: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: Category;
  day_of_week: string[];
  time_slot: string | null;
  age_group: string | null;
  location: string | null;
  tutor_name: string | null;
  tutor_contact: string | null;
  fee: string | null;
  max_students: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassWithMeta extends Class {
  interest_count: number;
  is_interested: boolean;
  verification_count: number;
  is_verified_by_me: boolean;
  is_reported_by_me: boolean;
  report_count: number;
  creator_apartment: string;
  creator_name: string | null;
}

export const REPORT_REASONS = [
  "Incorrect details",
  "Class no longer running",
  "Spam or fake listing",
  "Inappropriate content",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface Registration {
  id: string;
  class_id: string;
  resident_id: string;
  created_at: string;
}

export interface Session {
  residentId: string;
  apartment: string;
  isAdmin: boolean;
}

export type Category =
  | "dance"
  | "music"
  | "art"
  | "sports"
  | "academics"
  | "wellness"
  | "other";
