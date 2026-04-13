"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSession } from "./session";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(displayName: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();
  const { error } = await supabase
    .from("residents")
    .update({
      display_name: displayName.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.residentId);

  if (error) return { error: "Failed to update profile." };

  revalidatePath("/profile");
  return { success: true };
}

export async function changePin(currentPin: string, newPin: string) {
  const session = await getSession();
  if (!session) redirect("/");

  if (!/^\d{4}$/.test(newPin)) {
    return { error: "New PIN must be exactly 4 digits." };
  }

  const supabase = getSupabase();
  const { data: resident } = await supabase
    .from("residents")
    .select("pin_hash")
    .eq("id", session.residentId)
    .single();

  if (!resident) return { error: "Resident not found." };

  const valid = await bcrypt.compare(currentPin, resident.pin_hash);
  if (!valid) return { error: "Current PIN is incorrect." };

  const newHash = await bcrypt.hash(newPin, 10);
  const { error } = await supabase
    .from("residents")
    .update({ pin_hash: newHash, updated_at: new Date().toISOString() })
    .eq("id", session.residentId);

  if (error) return { error: "Failed to change PIN." };

  return { success: true };
}

export async function getHouseholdMembers() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = getSupabase();
  const { data } = await supabase
    .from("residents")
    .select("id, display_name")
    .eq("apartment", session.apartment)
    .neq("id", session.residentId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function resetHouseholdPin(targetResidentId: string, newPin: string) {
  const session = await getSession();
  if (!session) redirect("/");

  if (!/^\d{4}$/.test(newPin)) {
    return { error: "PIN must be exactly 4 digits." };
  }

  const supabase = getSupabase();

  // Verify the target is in the same apartment
  const { data: target } = await supabase
    .from("residents")
    .select("id, apartment, display_name")
    .eq("id", targetResidentId)
    .single();

  if (!target || target.apartment !== session.apartment) {
    return { error: "You can only reset PINs for members of your apartment." };
  }

  const newHash = await bcrypt.hash(newPin, 10);
  const { error } = await supabase
    .from("residents")
    .update({ pin_hash: newHash, updated_at: new Date().toISOString() })
    .eq("id", targetResidentId);

  if (error) return { error: "Failed to reset PIN." };

  return { success: true, name: target.display_name };
}
