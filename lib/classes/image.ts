"use server";

import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "class-images";

export async function uploadClassImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const session = await getSession();
  if (!session) redirect("/");

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return { url: undefined };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed." };
  }

  if (file.size > MAX_SIZE) {
    return { error: "Image must be under 5MB." };
  }

  const supabase = getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${session.residentId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error);
    return { error: "Failed to upload image." };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}
