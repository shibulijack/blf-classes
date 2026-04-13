"use server";

import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!session.isAdmin) redirect("/classes");
  return session;
}

export async function searchResidents(query: string) {
  await requireAdmin();

  const supabase = getSupabase();
  const { data } = await supabase
    .from("residents")
    .select("id, apartment, display_name, is_admin, created_at")
    .or(`apartment.ilike.%${query}%,display_name.ilike.%${query}%`)
    .order("apartment", { ascending: true })
    .limit(20);

  return data || [];
}

export async function adminResetPin(targetResidentId: string, newPin: string) {
  await requireAdmin();

  if (!/^\d{4}$/.test(newPin)) {
    return { error: "PIN must be exactly 4 digits." };
  }

  const supabase = getSupabase();

  const { data: target } = await supabase
    .from("residents")
    .select("id, apartment, display_name")
    .eq("id", targetResidentId)
    .single();

  if (!target) {
    return { error: "Resident not found." };
  }

  const newHash = await bcrypt.hash(newPin, 10);
  const { error } = await supabase
    .from("residents")
    .update({ pin_hash: newHash, updated_at: new Date().toISOString() })
    .eq("id", targetResidentId);

  if (error) return { error: "Failed to reset PIN." };

  return { success: true, name: target.display_name, apartment: target.apartment };
}

export async function getReportedClasses() {
  await requireAdmin();

  const supabase = getSupabase();
  const { data } = await supabase
    .from("class_reports")
    .select(
      `*, residents!resident_id(apartment, display_name), classes!class_id(id, title, created_by, tutor_name, tutor_contact, residents!created_by(apartment, display_name))`
    )
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  return (data || []).map((report) => {
    const reporter = report.residents as unknown as { apartment: string; display_name: string };
    const cls = report.classes as unknown as {
      id: string;
      title: string;
      created_by: string;
      tutor_name: string | null;
      tutor_contact: string | null;
      residents: { apartment: string; display_name: string };
    };
    return {
      id: report.id,
      reason: report.reason,
      details: report.details,
      created_at: report.created_at,
      reporter_name: reporter.display_name,
      reporter_apartment: reporter.apartment,
      class_id: cls.id,
      class_title: cls.title,
      class_created_by: cls.created_by,
      creator_name: cls.residents?.display_name || "",
      creator_apartment: cls.residents?.apartment || "",
      tutor_contact: cls.tutor_contact,
    };
  });
}

export async function resolveReport(reportId: string) {
  await requireAdmin();

  const supabase = getSupabase();
  const { error } = await supabase
    .from("class_reports")
    .update({ resolved: true })
    .eq("id", reportId);

  if (error) return { error: "Failed to resolve report." };
  return { success: true };
}

export async function searchClasses(query: string) {
  await requireAdmin();

  const supabase = getSupabase();
  const { data } = await supabase
    .from("classes")
    .select("id, title, category, tutor_name, location, is_active, created_at, residents!created_by(apartment, display_name)")
    .or(`title.ilike.%${query}%,tutor_name.ilike.%${query}%,location.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data || []).map((cls) => {
    const creator = cls.residents as unknown as { apartment: string; display_name: string };
    return {
      id: cls.id,
      title: cls.title,
      category: cls.category,
      tutor_name: cls.tutor_name,
      location: cls.location,
      is_active: cls.is_active,
      created_at: cls.created_at,
      creator_name: creator?.display_name || "",
      creator_apartment: creator?.apartment || "",
    };
  });
}

export async function adminDeleteClass(classId: string) {
  await requireAdmin();

  const supabase = getSupabase();

  // Also resolve all reports for this class
  await supabase
    .from("class_reports")
    .update({ resolved: true })
    .eq("class_id", classId);

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId);

  if (error) return { error: "Failed to delete class." };
  return { success: true };
}
