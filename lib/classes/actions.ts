"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { Category } from "@/lib/types";

interface ClassFormData {
  title: string;
  description: string;
  category: Category;
  day_of_week: string[];
  time_slot: string;
  age_group: string;
  location: string;
  tutor_name: string;
  tutor_contact: string;
  fee: string;
  max_students: string;
}

export async function createClass(formData: ClassFormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      created_by: session.residentId,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      day_of_week: formData.day_of_week,
      time_slot: formData.time_slot.trim() || null,
      age_group: formData.age_group || null,
      location: formData.location.trim() || null,
      tutor_name: formData.tutor_name.trim() || null,
      tutor_contact: formData.tutor_contact.trim() || null,
      fee: formData.fee.trim() || null,
      max_students: formData.max_students
        ? parseInt(formData.max_students)
        : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create class. Please try again." };
  }

  revalidatePath("/classes");
  redirect(`/classes/${data.id}`);
}

export async function updateClass(classId: string, formData: ClassFormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("classes")
    .select("created_by")
    .eq("id", classId)
    .single();

  if (!existing || existing.created_by !== session.residentId) {
    return { error: "You can only edit classes you created." };
  }

  const { error } = await supabase
    .from("classes")
    .update({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      day_of_week: formData.day_of_week,
      time_slot: formData.time_slot.trim() || null,
      age_group: formData.age_group || null,
      location: formData.location.trim() || null,
      tutor_name: formData.tutor_name.trim() || null,
      tutor_contact: formData.tutor_contact.trim() || null,
      fee: formData.fee.trim() || null,
      max_students: formData.max_students
        ? parseInt(formData.max_students)
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", classId);

  if (error) {
    return { error: "Failed to update class. Please try again." };
  }

  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  redirect(`/classes/${classId}`);
}

export async function toggleInterest(classId: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();

  // Check if already registered
  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("class_id", classId)
    .eq("resident_id", session.residentId)
    .single();

  if (existing) {
    await supabase.from("registrations").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("registrations")
      .insert({ class_id: classId, resident_id: session.residentId });
  }

  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  revalidatePath("/my");
}

export async function deleteClass(classId: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("classes")
    .select("created_by")
    .eq("id", classId)
    .single();

  if (!existing || existing.created_by !== session.residentId) {
    return { error: "You can only delete classes you created." };
  }

  await supabase.from("classes").delete().eq("id", classId);

  revalidatePath("/classes");
  revalidatePath("/my");
  redirect("/classes");
}

export async function toggleVerification(classId: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("class_verifications")
    .select("id")
    .eq("class_id", classId)
    .eq("resident_id", session.residentId)
    .single();

  if (existing) {
    await supabase.from("class_verifications").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("class_verifications")
      .insert({ class_id: classId, resident_id: session.residentId });
  }

  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
}

export async function submitReport(
  classId: string,
  reason: string,
  details: string
) {
  const session = await getSession();
  if (!session) redirect("/");

  if (!reason) return { error: "Please select a reason." };

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("class_reports")
    .select("id")
    .eq("class_id", classId)
    .eq("resident_id", session.residentId)
    .single();

  if (existing) {
    return { error: "You have already reported this class." };
  }

  const { error } = await supabase
    .from("class_reports")
    .insert({
      class_id: classId,
      resident_id: session.residentId,
      reason,
      details: details.trim() || null,
    });

  if (error) return { error: "Failed to submit report." };

  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  return { success: true };
}
